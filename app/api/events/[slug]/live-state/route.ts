import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { createServiceRoleSupabaseClient } from "@/lib/supabaseService";
import type {
  LiveScreenState,
  SpotlightParticipant,
  SpotlightParticipantPhoto,
} from "@/types/spotlight";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const SPOTLIGHT_PHOTO_POLL_LIMIT = 30;

type LiveStateResponse = {
  mode: "live" | "spotlight";
  updatedAt: string | null;
  participant: null | {
    id: string;
    displayName: string | null;
    title: string;
    subtitle: string | null;
    body: string | null;
    photos: Array<{
      id: string;
      publicUrl: string;
      uploadedAt: string;
    }>;
  };
  error?: "event_not_found";
  recoveredFromStaleState?: boolean;
};

type EventIdentity = {
  id: string;
};

type DbError = {
  message: string;
} | null;

type SelectResult<T> = Promise<{ data: T | null; error: DbError }>;
type SelectListResult<T> = Promise<{ data: T[] | null; error: DbError }>;

type SelectQuery<T> = {
  eq(column: string, value: string): SelectQuery<T>;
  order(column: string, options?: { ascending?: boolean }): SelectQuery<T>;
  limit(count: number): SelectListResult<T>;
  maybeSingle(): SelectResult<T>;
};

type SelectTable<T> = {
  select(columns: string): SelectQuery<T>;
};

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createLiveStateSupabaseClient();
  const eventsTable = supabase.from("events") as unknown as SelectTable<EventIdentity>;
  const { data: event, error: eventError } = await eventsTable
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (eventError) {
    console.error("Failed to load event for live state API", {
      slug,
      message: eventError.message,
    });
  }

  if (!event) {
    return createNoStoreLiveStateResponse(
      {
        ...createLiveStatePayload(),
        error: "event_not_found",
      },
      404,
    );
  }

  const liveStatesTable = supabase.from("live_screen_states") as unknown as SelectTable<LiveScreenState>;
  const { data: state, error: stateError } = await liveStatesTable
    .select("*")
    .eq("event_id", event.id)
    .maybeSingle();

  if (stateError || !state || state.mode === "live" || !state.active_participant_id) {
    if (stateError && !isMissingSpotlightSchemaError(stateError)) {
      console.error("Failed to load live screen state", {
        eventId: event.id,
        message: stateError.message,
      });
    }

    return createNoStoreLiveStateResponse(
      createLiveStatePayload({ updatedAt: state?.updated_at ?? null }),
    );
  }

  const participantsTable = supabase.from("spotlight_participants") as unknown as SelectTable<SpotlightParticipant>;
  const { data: participant, error: participantError } = await participantsTable
    .select("id,event_id,display_name,title,subtitle,body,created_at,updated_at")
    .eq("id", state.active_participant_id)
    .eq("event_id", event.id)
    .maybeSingle();

  if (participantError || !participant) {
    if (participantError) {
      console.error("Failed to load active spotlight participant", {
        eventId: event.id,
        participantId: state.active_participant_id,
        message: participantError.message,
      });
    }

    return createNoStoreLiveStateResponse(
      createLiveStatePayload({
        updatedAt: state.updated_at,
        recoveredFromStaleState: true,
      }),
    );
  }

  const photosTable = supabase.from("spotlight_participant_photos") as unknown as SelectTable<SpotlightParticipantPhoto>;
  const { data: photos, error: photosError } = await photosTable
    .select("id,participant_id,event_id,storage_path,public_url,uploaded_at")
    .eq("participant_id", participant.id)
    .eq("event_id", event.id)
    .order("uploaded_at", { ascending: false })
    .limit(SPOTLIGHT_PHOTO_POLL_LIMIT);

  if (photosError) {
    console.error("Failed to load active spotlight photos", {
      eventId: event.id,
      participantId: participant.id,
      message: photosError.message,
    });
  }

  return createNoStoreLiveStateResponse({
    mode: "spotlight",
    updatedAt: state.updated_at,
    participant: {
      id: participant.id,
      displayName: participant.display_name,
      title: participant.title,
      subtitle: participant.subtitle,
      body: participant.body,
      photos: (photos ?? []).map((photo) => ({
        id: photo.id,
        publicUrl: photo.public_url,
        uploadedAt: photo.uploaded_at,
      })),
    },
  });
}

async function createLiveStateSupabaseClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (serviceRoleKey && !serviceRoleKey.startsWith("sb_publishable_")) {
    return createServiceRoleSupabaseClient();
  }

  return createServerSupabaseClient({ persistCookies: false });
}

function createLiveStatePayload({
  updatedAt = null,
  recoveredFromStaleState,
}: {
  updatedAt?: string | null;
  recoveredFromStaleState?: boolean;
} = {}): LiveStateResponse {
  return {
    mode: "live",
    updatedAt,
    participant: null,
    recoveredFromStaleState,
  };
}

function createNoStoreLiveStateResponse(payload: LiveStateResponse, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
    },
  });
}

function isMissingSpotlightSchemaError(error: DbError) {
  return error?.message.includes("schema cache") ?? false;
}
