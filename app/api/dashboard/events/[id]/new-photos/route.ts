import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const since = new URL(request.url).searchParams.get("since");
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (eventError) {
    console.error("Failed to verify event owner for new photo count", {
      eventId: id,
      message: eventError.message,
    });
    return NextResponse.json({ error: "Failed to load event" }, { status: 500 });
  }

  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let query = supabase
    .from("photos")
    .select("id", { count: "exact", head: true })
    .eq("event_id", id);

  if (since) {
    query = query.gt("uploaded_at", since);
  }

  const { count, error } = await query;

  if (error) {
    console.error("Failed to load new photo count", {
      eventId: id,
      message: error.message,
    });
    return NextResponse.json({ error: "Failed to load new photo count" }, { status: 500 });
  }

  return NextResponse.json({ count: count ?? 0 });
}
