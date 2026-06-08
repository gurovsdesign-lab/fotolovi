import "server-only";

import { notFound } from "next/navigation";
import { PHOTO_BUCKET } from "@/lib/constants";
import { getEventLifecycle, getEventStatusLabel, type EventStatus } from "@/lib/eventStatus";
import { createServiceRoleSupabaseClient } from "@/lib/supabaseService";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

const ADMIN_USER_LIMIT = 50;
const ADMIN_RECENT_PHOTO_LIMIT = 72;
const ADMIN_PHOTO_GROUP_LIMIT = 8;
const ADMIN_PHOTOS_PER_GROUP = 8;
export const ADMIN_USER_PHOTO_PAGE_SIZE = 24;
const STORAGE_OBJECT_PAGE_SIZE = 1000;
const LIVE_LAUNCH_SCAN_LIMIT = 10000;

type QueryError = { message: string } | null;
type SupabaseClient = Awaited<ReturnType<typeof createServerSupabaseClient>>;

type ProfileRow = {
  id: string;
  email: string | null;
  role: "user" | "admin";
  created_at: string;
};

type CreditRow = {
  user_id: string;
  amount: number;
};

type EventRow = {
  id: string;
  user_id: string;
  title: string;
  event_date: string;
  slug: string;
  guest_access_mode: "upload_only" | "upload_view" | "upload_view_download";
  moderation_mode: "show_immediately" | "premoderation";
  created_at: string;
  updated_at: string;
  photos?: Array<{ count: number }> | { count: number } | null;
};

type PhotoRow = {
  id: string;
  event_id: string;
  storage_path: string;
  public_url: string;
  is_hidden: boolean;
  uploaded_at: string;
  events?: EventRow | null;
};

type StorageObjectRow = {
  name: string;
  size?: unknown;
  file_size?: unknown;
  metadata: Record<string, unknown> | null;
};

type StorageObject = {
  name: string;
  size: number;
  hasKnownSize: boolean;
};

type StorageDiagnosticSource = "storage-api" | "rpc" | "error";

export type AdminStorageDiagnostics = {
  source: StorageDiagnosticSource;
  scannedFoldersCount: number;
  scannedFilesCount: number;
  summedBytes: number;
  lastErrorMessage: string | null;
};

type StorageObjectResult = {
  objects: StorageObject[];
  diagnostics: AdminStorageDiagnostics;
  hasUnknownSize?: boolean;
};

type StorageListItem = {
  name: string;
  id?: string | null;
  metadata?: Record<string, unknown> | null;
  size?: unknown;
  file_size?: unknown;
};

type StorageObjectSizeRpcRow = {
  name: string;
  size_bytes: number | string | null;
};

type PremiumRequestRow = {
  id: string;
  user_id: string;
  status: "pending" | "fulfilled" | "canceled";
  created_at: string;
} & Record<string, unknown>;

export type AdminUserRow = ProfileRow & {
  credits_amount: number;
  event_count: number;
  photo_count: number;
  live_event_count: number;
  last_event_at: string | null;
  last_activity_at: string | null;
};

export type AdminPhotoGroup = {
  eventId: string;
  eventTitle: string;
  eventSlug: string;
  ownerEmail: string;
  statusLabel: string;
  photoCount: number;
  eventCreatedAt: string;
  lastPhotoAt: string | null;
  photos: Array<{
    id: string;
    public_url: string;
    storage_path: string;
    is_hidden: boolean;
    uploaded_at: string;
    moderation_status: string;
  }>;
};

export type AdminStorageUsage = {
  usedBytes: number;
  freeBytes: number | null;
  limitBytes: number | null;
  usagePercent: number | null;
  objectCount: number;
  isApproximate: boolean;
  note: string | null;
  diagnostics: AdminStorageDiagnostics;
};

export type AdminOverview = {
  search: string;
  usersTotal: number;
  usersLimit: number;
  userRows: AdminUserRow[];
  eventStats: {
    total: number;
    byStatus: Array<{ status: EventStatus; label: string; count: number }>;
    moderationCount: number;
    liveScreenCount: number;
  };
  photoStats: {
    total: number;
    hidden: number;
    moderationPendingEstimate: number;
    today: number;
    last7Days: number;
  };
  storage: AdminStorageUsage;
  photoGroups: AdminPhotoGroup[];
  premiumRequests: Array<PremiumRequestRow & { account_email: string }>;
  pendingPremiumRequestCount: number;
};

export type AdminUserEvent = EventRow & {
  status: EventStatus;
  statusLabel: string;
  photo_count: number;
  live_screen_available: boolean;
  live_screen_launch_count: number;
};

export type AdminUserPhoto = PhotoRow & {
  event_title: string;
  event_slug: string;
  moderation_status: string;
};

export type AdminUserDetail = {
  profile: AdminUserRow;
  storage: AdminStorageUsage;
  liveLaunchCount: number;
  events: AdminUserEvent[];
  photos: {
    page: number;
    pageSize: number;
    total: number;
    items: AdminUserPhoto[];
  };
};

export async function getAdminOverview({
  search = "",
}: {
  search?: string;
} = {}): Promise<AdminOverview> {
  const supabase = await createServerSupabaseClient();
  const normalizedSearch = normalizeSearch(search);

  const [
    usersTotal,
    eventRows,
    storage,
    profileRows,
    credits,
    premiumRequests,
    recentPhotos,
  ] = await Promise.all([
    getExactCount(supabase, "profiles"),
    getAdminEventRows(supabase),
    getStorageUsage(supabase),
    getAdminProfileRows(supabase, normalizedSearch),
    supabase.from("credits").select("user_id, amount"),
    (supabase.from("premium_requests") as any)
      .select("*")
      .order("status", { ascending: false })
      .order("created_at", { ascending: false }),
    getRecentAdminPhotos(supabase),
  ]);

  logAdminQueryError("credits", credits.error);
  logAdminQueryError("premium requests", premiumRequests.error);

  const creditRows = (credits.data ?? []) as CreditRow[];
  const premiumRequestRows = (premiumRequests.data ?? []) as PremiumRequestRow[];
  const [photoStats, latestPhotoByEventId, profileEmailById] = await Promise.all([
    getAdminPhotoStats(supabase, eventRows),
    getLatestPhotoAtByEventId(supabase, getVisibleUserEventIds(profileRows, eventRows)),
    getProfileEmailMap(
      supabase,
      getReferencedProfileIds(profileRows, premiumRequestRows, recentPhotos),
      profileRows,
    ),
  ]);
  const userRows = buildAdminUserRows(
    profileRows,
    creditRows,
    eventRows,
    latestPhotoByEventId,
  );

  return {
    search: normalizedSearch,
    usersTotal,
    usersLimit: ADMIN_USER_LIMIT,
    userRows,
    eventStats: buildEventStats(eventRows),
    photoStats,
    storage,
    photoGroups: buildPhotoGroups(recentPhotos, eventRows, profileEmailById),
    premiumRequests: premiumRequestRows
      .map((request) => ({
        ...request,
        account_email: profileEmailById.get(request.user_id) ?? "Почта не найдена",
      }))
      .sort((left, right) => {
        const leftPending = left.status === "pending" ? 0 : 1;
        const rightPending = right.status === "pending" ? 0 : 1;
        if (leftPending !== rightPending) return leftPending - rightPending;
        return String(right.created_at).localeCompare(String(left.created_at));
      }),
    pendingPremiumRequestCount: premiumRequestRows.filter(
      (request) => request.status === "pending",
    ).length,
  };
}

export async function getAdminUserDetail(
  userId: string,
  photoPage = 1,
): Promise<AdminUserDetail> {
  const supabase = await createServerSupabaseClient();
  const page = Math.max(1, Number.isFinite(photoPage) ? Math.floor(photoPage) : 1);
  const from = (page - 1) * ADMIN_USER_PHOTO_PAGE_SIZE;
  const to = from + ADMIN_USER_PHOTO_PAGE_SIZE - 1;

  const [profileResult, credits, events, storageObjectsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,email,role,created_at")
      .eq("id", userId)
      .maybeSingle(),
    supabase.from("credits").select("user_id, amount").eq("user_id", userId),
    getAdminEventRows(supabase, userId),
    getStorageObjects(supabase),
  ]);

  logAdminQueryError("profile detail", profileResult.error);
  logAdminQueryError("user credits", credits.error);

  if (!profileResult.data) notFound();

  const profile = profileResult.data as ProfileRow;
  const eventIds = events.map((event) => event.id);
  const [photoCount, userPhotos, liveLaunches, latestPhotoByEventId] = await Promise.all([
    getUserPhotoCount(supabase, eventIds),
    getUserPhotosPage(supabase, eventIds, from, to),
    getLiveLaunchCounts(supabase, userId),
    getLatestPhotoAtByEventId(supabase, eventIds),
  ]);

  const eventRows = buildAdminUserEvents(events, liveLaunches.byEventId);
  const profileRow = buildAdminUserRows(
    [profile],
    (credits.data ?? []) as CreditRow[],
    events,
    latestPhotoByEventId,
  )[0];

  return {
    profile: {
      ...profileRow,
      photo_count: photoCount,
    },
    storage: buildStorageUsage(
      storageObjectsResult.objects.filter((object) =>
        eventIds.some((id) => object.name.startsWith(`${id}/`)),
      ),
    ),
    liveLaunchCount: liveLaunches.total,
    events: eventRows,
    photos: {
      page,
      pageSize: ADMIN_USER_PHOTO_PAGE_SIZE,
      total: photoCount,
      items: userPhotos,
    },
  };
}

async function getAdminProfileRows(supabase: SupabaseClient, search: string) {
  if (!search) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id,email,role,created_at")
      .order("created_at", { ascending: false })
      .limit(ADMIN_USER_LIMIT);

    logAdminQueryError("profiles", error);
    return (data ?? []) as ProfileRow[];
  }

  const eventOwnerIds = await getUserIdsByEventSearch(supabase, search);
  const emailProfilesQuery = supabase
    .from("profiles")
    .select("id,email,role,created_at")
    .ilike("email", `%${escapeIlike(search)}%`)
    .order("created_at", { ascending: false })
    .limit(ADMIN_USER_LIMIT);

  const ownerProfilesQuery = eventOwnerIds.length
    ? supabase
        .from("profiles")
        .select("id,email,role,created_at")
        .in("id", eventOwnerIds)
        .limit(ADMIN_USER_LIMIT)
    : Promise.resolve({ data: [], error: null });

  const [emailProfiles, ownerProfiles] = await Promise.all([
    emailProfilesQuery,
    ownerProfilesQuery,
  ]);

  logAdminQueryError("profiles by email", emailProfiles.error);
  logAdminQueryError("profiles by event", ownerProfiles.error);

  const byId = new Map<string, ProfileRow>();
  for (const profile of [
    ...((emailProfiles.data ?? []) as ProfileRow[]),
    ...((ownerProfiles.data ?? []) as ProfileRow[]),
  ]) {
    byId.set(profile.id, profile);
  }

  return Array.from(byId.values())
    .sort((left, right) => right.created_at.localeCompare(left.created_at))
    .slice(0, ADMIN_USER_LIMIT);
}

async function getUserIdsByEventSearch(supabase: SupabaseClient, search: string) {
  const { data, error } = await supabase
    .from("events")
    .select("user_id")
    .or(`slug.ilike.%${escapeIlike(search)}%,title.ilike.%${escapeIlike(search)}%`)
    .limit(ADMIN_USER_LIMIT * 4);

  logAdminQueryError("event search", error);

  return Array.from(new Set(((data ?? []) as Array<{ user_id: string }>).map((row) => row.user_id)));
}

async function getAdminEventRows(supabase: SupabaseClient, userId?: string) {
  let query = (supabase.from("events") as any)
    .select(
      "id,user_id,title,event_date,slug,guest_access_mode,moderation_mode,created_at,updated_at,photos(count)",
    )
    .order("created_at", { ascending: false });

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;
  logAdminQueryError(userId ? "user events" : "events", error);

  return (data ?? []) as EventRow[];
}

async function getAdminPhotoStats(supabase: SupabaseClient, eventRows: EventRow[]) {
  const premoderatedEventIds = eventRows
    .filter((event) => event.moderation_mode === "premoderation")
    .map((event) => event.id);
  const todayStart = getMoscowTodayStartIso();
  const last7DaysStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [total, hidden, today, last7Days, moderationPendingEstimate] = await Promise.all([
    getExactCount(supabase, "photos"),
    getExactCount(supabase, "photos", (query) => query.eq("is_hidden", true)),
    getExactCount(supabase, "photos", (query) => query.gte("uploaded_at", todayStart)),
    getExactCount(supabase, "photos", (query) => query.gte("uploaded_at", last7DaysStart)),
    getPremoderationHiddenPhotoCount(supabase, premoderatedEventIds),
  ]);

  return {
    total,
    hidden,
    moderationPendingEstimate,
    today,
    last7Days,
  };
}

async function getPremoderationHiddenPhotoCount(
  supabase: SupabaseClient,
  eventIds: string[],
) {
  if (!eventIds.length) return 0;

  const { count, error } = await supabase
    .from("photos")
    .select("*", { count: "exact", head: true })
    .eq("is_hidden", true)
    .in("event_id", eventIds);

  logAdminQueryError("premoderation photos", error);
  return count ?? 0;
}

async function getRecentAdminPhotos(supabase: SupabaseClient) {
  const { data, error } = await (supabase.from("photos") as any)
    .select(
      "id,event_id,storage_path,public_url,is_hidden,uploaded_at,events(id,user_id,title,event_date,slug,guest_access_mode,moderation_mode,created_at,updated_at)",
    )
    .order("uploaded_at", { ascending: false })
    .limit(ADMIN_RECENT_PHOTO_LIMIT);

  logAdminQueryError("recent photos", error);
  return (data ?? []) as PhotoRow[];
}

async function getUserPhotosPage(
  supabase: SupabaseClient,
  eventIds: string[],
  from: number,
  to: number,
) {
  if (!eventIds.length) return [];

  const { data, error } = await (supabase.from("photos") as any)
    .select(
      "id,event_id,storage_path,public_url,is_hidden,uploaded_at,events(id,user_id,title,event_date,slug,guest_access_mode,moderation_mode,created_at,updated_at)",
    )
    .in("event_id", eventIds)
    .order("uploaded_at", { ascending: false })
    .range(from, to);

  logAdminQueryError("user photos", error);

  return ((data ?? []) as PhotoRow[]).map((photo) => ({
    ...photo,
    event_title: photo.events ? getEventDisplayTitle(photo.events) : "Мероприятие не найдено",
    event_slug: photo.events?.slug ?? "",
    moderation_status: getPhotoModerationStatus(photo),
  }));
}

async function getUserPhotoCount(supabase: SupabaseClient, eventIds: string[]) {
  if (!eventIds.length) return 0;

  const { count, error } = await supabase
    .from("photos")
    .select("*", { count: "exact", head: true })
    .in("event_id", eventIds);

  logAdminQueryError("user photo count", error);
  return count ?? 0;
}

async function getLiveLaunchCounts(supabase: SupabaseClient, userId: string) {
  const { count, error: countError } = await (supabase.from("live_screen_launches") as any)
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (countError) {
    logAdminQueryError("live screen launch count", countError);
    return { total: 0, byEventId: new Map<string, number>() };
  }

  const { data, error } = await (supabase.from("live_screen_launches") as any)
    .select("event_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(LIVE_LAUNCH_SCAN_LIMIT);

  logAdminQueryError("live screen launches", error);

  const byEventId = new Map<string, number>();
  for (const row of (data ?? []) as Array<{ event_id: string }>) {
    byEventId.set(row.event_id, (byEventId.get(row.event_id) ?? 0) + 1);
  }

  return { total: count ?? 0, byEventId };
}

async function getStorageUsage(supabase: SupabaseClient): Promise<AdminStorageUsage> {
  const result = await getStorageObjects(supabase);
  logStorageUsageDebug(result);
  return buildStorageUsage(result.objects, result.diagnostics);
}

async function getStorageObjects(fallbackSupabase?: SupabaseClient): Promise<StorageObjectResult> {
  const storageClient = createStorageSupabaseClient();
  const supabase = storageClient.client ?? fallbackSupabase;

  if (!supabase) {
    return createStorageObjectResult([], {
      source: "error",
      scannedFoldersCount: 0,
      lastErrorMessage: storageClient.errorMessage ?? "Supabase client is unavailable.",
    });
  }

  const storageApiResult = await getStorageObjectsFromStorageApi(supabase);
  const storageApiBytes = sumStorageObjectBytes(storageApiResult.objects);
  if (
    storageApiResult.objects.length > 0 &&
    !storageApiResult.hasUnknownSize &&
    storageApiBytes > 0
  ) {
    return storageApiResult;
  }

  const rpcResult = await getStorageObjectsFromRpc(supabase);
  if (rpcResult.objects.length && sumStorageObjectBytes(rpcResult.objects) > 0) {
    return rpcResult;
  }

  const exposedSchemaResult = await getStorageObjectsFromExposedStorageSchema(supabase);
  if (exposedSchemaResult.objects.length && sumStorageObjectBytes(exposedSchemaResult.objects) > 0) {
    return exposedSchemaResult;
  }

  return createStorageObjectResult(storageApiResult.objects, {
    source: "error",
    scannedFoldersCount: storageApiResult.diagnostics.scannedFoldersCount,
    lastErrorMessage: joinStorageErrors([
      storageClient.errorMessage ? `service-role: ${storageClient.errorMessage}` : null,
      storageApiResult.diagnostics.lastErrorMessage
        ? `storage-api: ${storageApiResult.diagnostics.lastErrorMessage}`
        : null,
      rpcResult.diagnostics.lastErrorMessage ? `rpc: ${rpcResult.diagnostics.lastErrorMessage}` : null,
      exposedSchemaResult.diagnostics.lastErrorMessage
        ? `storage-schema: ${exposedSchemaResult.diagnostics.lastErrorMessage}`
        : null,
    ]),
  });
}

async function getStorageObjectsFromStorageApi(supabase: SupabaseClient) {
  const objects: StorageObject[] = [];
  const queuedPrefixes = [""];
  const visitedPrefixes = new Set<string>();
  const folderPaths: string[] = [];
  let hasUnknownSize = false;
  let lastErrorMessage: string | null = null;

  console.info("Admin storage scan started", {
    bucket: PHOTO_BUCKET,
    source: "storage-api",
  });

  for (let index = 0; index < queuedPrefixes.length; index += 1) {
    const prefix = queuedPrefixes[index];
    if (visitedPrefixes.has(prefix)) continue;
    visitedPrefixes.add(prefix);

    const pageSignatures = new Set<string>();

    for (let offset = 0; ; ) {
      const { data, error } = await supabase.storage.from(PHOTO_BUCKET).list(prefix, {
        limit: STORAGE_OBJECT_PAGE_SIZE,
        offset,
        sortBy: { column: "name", order: "asc" },
      });

      if (error) {
        logAdminQueryError("storage api objects", error);
        lastErrorMessage = error.message;
        return createStorageObjectResult(objects, {
          source: "storage-api",
          scannedFoldersCount: folderPaths.length,
          lastErrorMessage,
          hasUnknownSize: true,
        });
      }

      const page = ((data ?? []) as StorageListItem[]).filter((item) => item.name);
      if (!page.length) break;

      const pageSignature = page.map((item) => `${item.id ?? "folder"}:${item.name}`).join("|");
      if (pageSignatures.has(pageSignature)) {
        console.warn("Stopped repeated storage api page while calculating admin storage usage", {
          bucket: PHOTO_BUCKET,
          prefix,
          offset,
          pageSize: page.length,
        });
        hasUnknownSize = true;
        lastErrorMessage = `Repeated storage api page for prefix "${prefix}" at offset ${offset}.`;
        break;
      }
      pageSignatures.add(pageSignature);

      for (const item of page) {
        const name = prefix ? `${prefix}/${item.name}` : item.name;

        if (isStorageFolder(item)) {
          folderPaths.push(name);
          queuedPrefixes.push(name);
          continue;
        }

        const size = getStorageObjectSize(item);
        const hasKnownSize = size !== null;
        hasUnknownSize = hasUnknownSize || !hasKnownSize;
        objects.push({
          name,
          size: size ?? 0,
          hasKnownSize,
        });
      }

      offset += page.length;
    }
  }

  const result = createStorageObjectResult(objects, {
    source: "storage-api",
    scannedFoldersCount: folderPaths.length,
    lastErrorMessage,
    hasUnknownSize,
  });

  console.info("Admin storage scan finished", {
    bucket: PHOTO_BUCKET,
    source: result.diagnostics.source,
    rootFoldersCount: folderPaths.filter((path) => !path.includes("/")).length,
    firstFolderPath: folderPaths[0] ?? null,
    fileCount: result.diagnostics.scannedFilesCount,
    summedBytes: result.diagnostics.summedBytes,
    lastErrorMessage: result.diagnostics.lastErrorMessage,
  });

  return result;
}

async function getStorageObjectsFromRpc(supabase: SupabaseClient): Promise<StorageObjectResult> {
  const { data, error } = await (supabase as any).rpc("get_storage_bucket_object_sizes", {
    p_bucket_id: PHOTO_BUCKET,
  });

  if (error) {
    logAdminQueryError("storage object size rpc", error);
    console.info("Admin storage rpc finished", {
      bucket: PHOTO_BUCKET,
      rows: 0,
      summedBytes: 0,
      lastErrorMessage: error.message,
    });
    return createStorageObjectResult([], {
      source: "rpc",
      scannedFoldersCount: 0,
      lastErrorMessage: error.message,
    });
  }

  const objects = ((data ?? []) as StorageObjectSizeRpcRow[]).map((object) => {
    const size = normalizeStorageSizeValue(object.size_bytes);
    return {
      name: object.name,
      size: size ?? 0,
      hasKnownSize: size !== null,
    };
  });

  const result = createStorageObjectResult(objects, {
    source: "rpc",
    scannedFoldersCount: 0,
    lastErrorMessage: null,
  });

  console.info("Admin storage rpc finished", {
    bucket: PHOTO_BUCKET,
    rows: result.diagnostics.scannedFilesCount,
    summedBytes: result.diagnostics.summedBytes,
    lastErrorMessage: result.diagnostics.lastErrorMessage,
  });

  return result;
}

async function getStorageObjectsFromExposedStorageSchema(
  supabase: SupabaseClient,
): Promise<StorageObjectResult> {
  const objects: StorageObject[] = [];
  let lastErrorMessage: string | null = null;

  for (let from = 0; ; from += STORAGE_OBJECT_PAGE_SIZE) {
    const { data, error } = await ((supabase as any).schema("storage") as any)
      .from("objects")
      .select("*")
      .eq("bucket_id", PHOTO_BUCKET)
      .range(from, from + STORAGE_OBJECT_PAGE_SIZE - 1);

    if (error) {
      logAdminQueryError("storage objects", error);
      lastErrorMessage = error.message;
      return createStorageObjectResult(objects, {
        source: "error",
        scannedFoldersCount: 0,
        lastErrorMessage,
      });
    }

    const page = (data ?? []) as StorageObjectRow[];
    for (const object of page) {
      const size = getStorageObjectSize(object);
      objects.push({
        name: object.name,
        size: size ?? 0,
        hasKnownSize: size !== null,
      });
    }

    if (page.length < STORAGE_OBJECT_PAGE_SIZE) break;
  }

  return createStorageObjectResult(objects, {
    source: "error",
    scannedFoldersCount: 0,
    lastErrorMessage,
  });
}

function createStorageSupabaseClient() {
  try {
    return {
      client: createServiceRoleSupabaseClient() as unknown as SupabaseClient,
      errorMessage: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to create service role client for storage usage", {
      message,
    });
    return {
      client: null,
      errorMessage: message,
    };
  }
}

function buildStorageUsage(
  objects: StorageObject[],
  diagnostics = createStorageDiagnostics(objects, {
    source: "storage-api",
    scannedFoldersCount: 0,
    lastErrorMessage: null,
  }),
): AdminStorageUsage {
  const usedBytes = objects.reduce((sum, object) => sum + object.size, 0);
  const limitBytes = getConfiguredStorageLimitBytes();
  const freeBytes = limitBytes === null ? null : Math.max(0, limitBytes - usedBytes);
  const usagePercent =
    limitBytes === null || limitBytes <= 0
      ? null
      : Math.min(100, Math.round((usedBytes / limitBytes) * 1000) / 10);

  return {
    usedBytes,
    freeBytes,
    limitBytes,
    usagePercent,
    objectCount: objects.length,
    isApproximate: objects.some((object) => !object.hasKnownSize) || limitBytes === null,
    diagnostics,
    note:
      limitBytes === null
        ? "Лимит берётся из SUPABASE_STORAGE_LIMIT_BYTES или SUPABASE_STORAGE_LIMIT_GB."
        : objects.some((object) => !object.hasKnownSize)
          ? "Для части объектов storage не удалось определить размер."
          : null,
  };
}

function logStorageUsageDebug(result: StorageObjectResult) {
  console.info("Admin storage usage calculated", {
    bucket: PHOTO_BUCKET,
    source: result.diagnostics.source,
    scannedFoldersCount: result.diagnostics.scannedFoldersCount,
    fileCount: result.diagnostics.scannedFilesCount,
    summedBytes: result.diagnostics.summedBytes,
    lastErrorMessage: result.diagnostics.lastErrorMessage,
  });
}

function createStorageObjectResult(
  objects: StorageObject[],
  options: {
    source: StorageDiagnosticSource;
    scannedFoldersCount: number;
    lastErrorMessage: string | null;
    hasUnknownSize?: boolean;
  },
): StorageObjectResult {
  return {
    objects,
    diagnostics: createStorageDiagnostics(objects, options),
    hasUnknownSize: options.hasUnknownSize,
  };
}

function createStorageDiagnostics(
  objects: StorageObject[],
  options: {
    source: StorageDiagnosticSource;
    scannedFoldersCount: number;
    lastErrorMessage: string | null;
  },
): AdminStorageDiagnostics {
  return {
    source: options.source,
    scannedFoldersCount: options.scannedFoldersCount,
    scannedFilesCount: objects.length,
    summedBytes: sumStorageObjectBytes(objects),
    lastErrorMessage: options.lastErrorMessage,
  };
}

function joinStorageErrors(errors: Array<string | null>) {
  return errors.filter((error): error is string => Boolean(error)).join(" | ") || "Storage scan returned zero bytes.";
}

function sumStorageObjectBytes(objects: StorageObject[]) {
  return objects.reduce((sum, object) => sum + object.size, 0);
}

async function getExactCount(
  supabase: SupabaseClient,
  table: "profiles" | "events" | "photos",
  configure?: (query: any) => any,
) {
  let query = supabase.from(table).select("*", { count: "exact", head: true });
  if (configure) query = configure(query);
  const { count, error } = await query;
  logAdminQueryError(`${table} count`, error);
  return count ?? 0;
}

async function getLatestPhotoAtByEventId(supabase: SupabaseClient, eventIds: string[]) {
  const byEventId = new Map<string, string>();
  if (!eventIds.length) return byEventId;

  const { data, error } = await supabase
    .from("photos")
    .select("event_id,uploaded_at")
    .in("event_id", eventIds)
    .order("uploaded_at", { ascending: false })
    .limit(Math.min(ADMIN_USER_LIMIT * 20, 1000));

  logAdminQueryError("latest photo activity", error);

  for (const photo of (data ?? []) as Array<{ event_id: string; uploaded_at: string }>) {
    if (!byEventId.has(photo.event_id)) byEventId.set(photo.event_id, photo.uploaded_at);
  }

  return byEventId;
}

async function getProfileEmailMap(
  supabase: SupabaseClient,
  userIds: string[],
  knownProfiles: ProfileRow[],
) {
  const byId = new Map(knownProfiles.map((profile) => [profile.id, profile.email]));
  const missingIds = userIds.filter((id) => !byId.has(id));

  if (!missingIds.length) return byId;

  const { data, error } = await supabase
    .from("profiles")
    .select("id,email")
    .in("id", missingIds)
    .limit(ADMIN_RECENT_PHOTO_LIMIT + ADMIN_USER_LIMIT);

  logAdminQueryError("referenced profile emails", error);

  for (const profile of (data ?? []) as Array<{ id: string; email: string | null }>) {
    byId.set(profile.id, profile.email);
  }

  return byId;
}

function getReferencedProfileIds(
  profiles: ProfileRow[],
  premiumRequests: PremiumRequestRow[],
  recentPhotos: PhotoRow[],
) {
  return Array.from(
    new Set([
      ...profiles.map((profile) => profile.id),
      ...premiumRequests.map((request) => request.user_id),
      ...recentPhotos
        .map((photo) => photo.events?.user_id)
        .filter((userId): userId is string => Boolean(userId)),
    ]),
  );
}

function getVisibleUserEventIds(profiles: ProfileRow[], events: EventRow[]) {
  const visibleUserIds = new Set(profiles.map((profile) => profile.id));
  return events
    .filter((event) => visibleUserIds.has(event.user_id))
    .map((event) => event.id);
}

function buildAdminUserRows(
  profiles: ProfileRow[],
  credits: CreditRow[],
  events: EventRow[],
  latestPhotoByEventId = new Map<string, string>(),
): AdminUserRow[] {
  const creditsByUserId = new Map(credits.map((credit) => [credit.user_id, credit.amount]));
  const eventsByUserId = new Map<string, EventRow[]>();

  for (const event of events) {
    const list = eventsByUserId.get(event.user_id) ?? [];
    list.push(event);
    eventsByUserId.set(event.user_id, list);
  }

  return profiles.map((profile) => {
    const userEvents = eventsByUserId.get(profile.id) ?? [];
    const photoCount = userEvents.reduce((sum, event) => sum + getNestedCount(event.photos), 0);
    const lastEventAt = userEvents.reduce<string | null>(
      (latest, event) => maxIsoDate(latest, event.event_date),
      null,
    );
    const lastActivityAt = userEvents.reduce<string | null>(
      (latest, event) =>
        maxIsoDate(
          maxIsoDate(latest, event.updated_at),
          latestPhotoByEventId.get(event.id) ?? null,
        ),
      profile.created_at,
    );

    return {
      ...profile,
      credits_amount: creditsByUserId.get(profile.id) ?? 0,
      event_count: userEvents.length,
      photo_count: photoCount,
      live_event_count: userEvents.filter(
        (event) => getEventLifecycle(event.event_date).permissions.canUseLiveScreen,
      ).length,
      last_event_at: lastEventAt,
      last_activity_at: lastActivityAt,
    };
  });
}

function buildAdminUserEvents(
  events: EventRow[],
  launchCountsByEventId: Map<string, number>,
): AdminUserEvent[] {
  return events.map((event) => {
    const lifecycle = getEventLifecycle(event.event_date);

    return {
      ...event,
      status: lifecycle.status,
      statusLabel: getEventStatusLabel(lifecycle.status),
      photo_count: getNestedCount(event.photos),
      live_screen_available: lifecycle.permissions.canUseLiveScreen,
      live_screen_launch_count: launchCountsByEventId.get(event.id) ?? 0,
    };
  });
}

function buildEventStats(events: EventRow[]) {
  const byStatus = new Map<EventStatus, number>();
  let moderationCount = 0;
  let liveScreenCount = 0;

  for (const event of events) {
    const lifecycle = getEventLifecycle(event.event_date);
    byStatus.set(lifecycle.status, (byStatus.get(lifecycle.status) ?? 0) + 1);
    if (event.moderation_mode === "premoderation") moderationCount += 1;
    if (lifecycle.permissions.canUseLiveScreen) liveScreenCount += 1;
  }

  const statuses: EventStatus[] = ["planned", "current", "recent", "storage", "completed"];

  return {
    total: events.length,
    byStatus: statuses.map((status) => ({
      status,
      label: getEventStatusLabel(status),
      count: byStatus.get(status) ?? 0,
    })),
    moderationCount,
    liveScreenCount,
  };
}

function buildPhotoGroups(
  photos: PhotoRow[],
  events: EventRow[],
  profileEmailById: Map<string, string | null>,
) {
  const eventsById = new Map(events.map((event) => [event.id, event]));
  const groupsByEventId = new Map<string, AdminPhotoGroup>();

  for (const photo of photos) {
    const event = eventsById.get(photo.event_id) ?? photo.events;
    if (!event) continue;

    const existing = groupsByEventId.get(event.id);
    const statusLabel = getEventStatusLabel(getEventLifecycle(event.event_date).status);

    if (!existing) {
      groupsByEventId.set(event.id, {
        eventId: event.id,
        eventTitle: getEventDisplayTitle(event),
        eventSlug: event.slug,
        ownerEmail: profileEmailById.get(event.user_id) ?? "Почта не найдена",
        statusLabel,
        photoCount: getNestedCount(event.photos),
        eventCreatedAt: event.created_at,
        lastPhotoAt: photo.uploaded_at,
        photos: [],
      });
    }

    const group = groupsByEventId.get(event.id);
    if (!group || group.photos.length >= ADMIN_PHOTOS_PER_GROUP) continue;

    group.photos.push({
      id: photo.id,
      public_url: photo.public_url,
      storage_path: photo.storage_path,
      is_hidden: photo.is_hidden,
      uploaded_at: photo.uploaded_at,
      moderation_status: getPhotoModerationStatus(photo),
    });

    group.lastPhotoAt = maxIsoDate(group.lastPhotoAt, photo.uploaded_at);
  }

  return Array.from(groupsByEventId.values())
    .sort((left, right) => String(right.lastPhotoAt).localeCompare(String(left.lastPhotoAt)))
    .slice(0, ADMIN_PHOTO_GROUP_LIMIT);
}

function getPhotoModerationStatus(photo: PhotoRow) {
  if (!photo.is_hidden) return "Видимое";
  if (photo.events?.moderation_mode === "premoderation") return "На модерации";
  return "Скрыто";
}

function getEventDisplayTitle(event: Pick<EventRow, "title" | "slug">) {
  const title = event.title.trim();
  return title || event.slug;
}

function getNestedCount(value: EventRow["photos"]) {
  if (!value) return 0;
  if (Array.isArray(value)) return Number(value[0]?.count ?? 0);
  return Number(value.count ?? 0);
}

function isStorageFolder(item: StorageListItem) {
  return item.id === null && !item.metadata;
}

function getStorageObjectSize(object: {
  size?: unknown;
  file_size?: unknown;
  metadata?: Record<string, unknown> | null;
}) {
  for (const value of [object.size, object.file_size]) {
    const size = normalizeStorageSizeValue(value);
    if (size !== null) return size;
  }

  return getStorageMetadataSize(object.metadata);
}

function getStorageMetadataSize(metadata: Record<string, unknown> | null | undefined): number | null {
  if (!metadata) return null;

  for (const key of [
    "size",
    "file_size",
    "fileSize",
    "contentLength",
    "content_length",
    "Content-Length",
  ]) {
    const size = normalizeStorageSizeValue(metadata[key]);
    if (size !== null) return size;
  }

  for (const value of Object.values(metadata)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const size = getStorageMetadataSize(value as Record<string, unknown>);
      if (size !== null) return size;
    }
  }

  return null;
}

function normalizeStorageSizeValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 0) return parsed;
  }

  return null;
}

function getConfiguredStorageLimitBytes() {
  const bytes = Number(process.env.SUPABASE_STORAGE_LIMIT_BYTES);
  if (Number.isFinite(bytes) && bytes > 0) return bytes;

  const gigabytes = Number(process.env.SUPABASE_STORAGE_LIMIT_GB);
  if (Number.isFinite(gigabytes) && gigabytes > 0) {
    return Math.round(gigabytes * 1024 * 1024 * 1024);
  }

  return null;
}

function getMoscowTodayStartIso() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Moscow",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  if (!year || !month || !day) return new Date().toISOString();
  return new Date(Date.UTC(year, month - 1, day, -3, 0, 0, 0)).toISOString();
}

function maxIsoDate(left: string | null, right: string | null) {
  if (!left) return right;
  if (!right) return left;
  return right > left ? right : left;
}

function normalizeSearch(value: string) {
  return value.trim().slice(0, 120);
}

function escapeIlike(value: string) {
  return value.replace(/[%_]/g, (match) => `\\${match}`);
}

function logAdminQueryError(label: string, error: QueryError) {
  if (!error) return;
  console.error(`Failed to load admin ${label}`, { message: error.message });
}
