import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
    console.error("Failed to verify event owner for hidden photo count", {
      eventId: id,
      message: eventError.message,
    });
    return NextResponse.json({ error: "Failed to load event" }, { status: 500 });
  }

  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { count, error } = await supabase
    .from("photos")
    .select("id", { count: "exact", head: true })
    .eq("event_id", id)
    .eq("is_hidden", true);

  if (error) {
    console.error("Failed to load hidden photo count", {
      eventId: id,
      message: error.message,
    });
    return NextResponse.json({ error: "Failed to load hidden photo count" }, { status: 500 });
  }

  return NextResponse.json({ count: count ?? 0 });
}
