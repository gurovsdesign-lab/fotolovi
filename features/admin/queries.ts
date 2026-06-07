import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function getAdminOverview() {
  const supabase = await createServerSupabaseClient();

  const [profiles, events, photos, credits, premiumRequests] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("events").select("*").order("created_at", { ascending: false }),
    supabase
      .from("photos")
      .select("*")
      .order("uploaded_at", { ascending: false })
      .limit(100),
    supabase.from("credits").select("user_id, amount"),
    (supabase.from("premium_requests") as any)
      .select("*")
      .order("status", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  logAdminQueryError("profiles", profiles.error);
  logAdminQueryError("events", events.error);
  logAdminQueryError("photos", photos.error);
  logAdminQueryError("credits", credits.error);
  logAdminQueryError("premium requests", premiumRequests.error);

  const creditsByUserId = new Map(
    ((credits.data ?? []) as Array<{ user_id: string; amount: number }>).map((credit) => [
      credit.user_id,
      credit.amount,
    ]),
  );
  const profileRows = (profiles.data ?? []) as Array<
    { id: string; email: string | null } & Record<string, unknown>
  >;
  const emailByUserId = new Map(
    profileRows.map((profile) => [profile.id, profile.email]),
  );
  const requestRows = (premiumRequests.data ?? []) as Array<
    {
      id: string;
      user_id: string;
      status: "pending" | "fulfilled" | "canceled";
      created_at: string;
    } & Record<string, unknown>
  >;

  return {
    profiles: profileRows.map((profile) => ({
      ...profile,
      credits_amount: creditsByUserId.get(profile.id) ?? 0,
    })),
    events: events.data ?? [],
    photos: photos.data ?? [],
    premiumRequests: requestRows
      .map((request) => ({
        ...request,
        account_email: emailByUserId.get(request.user_id) ?? "Почта не найдена",
      }))
      .sort((left, right) => {
        const leftPending = left.status === "pending" ? 0 : 1;
        const rightPending = right.status === "pending" ? 0 : 1;
        if (leftPending !== rightPending) return leftPending - rightPending;
        return String(right.created_at).localeCompare(String(left.created_at));
      }),
    pendingPremiumRequestCount: requestRows.filter(
      (request) => request.status === "pending",
    ).length,
  };
}

function logAdminQueryError(label: string, error: { message: string } | null) {
  if (!error) return;
  console.error(`Failed to load admin ${label}`, { message: error.message });
}
