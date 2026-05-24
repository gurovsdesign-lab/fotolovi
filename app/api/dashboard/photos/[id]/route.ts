import { NextResponse } from "next/server";
import { PHOTO_BUCKET } from "@/lib/constants";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const eventId = String(body?.eventId || "");
  const isHidden = body?.isHidden === true;

  if (!eventId) {
    return NextResponse.json({ error: "Missing event id" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const ownerCheck = await verifyEventOwner(supabase, eventId);

  if (ownerCheck) return ownerCheck;

  const { error } = await supabase
    .from("photos")
    .update({ is_hidden: !isHidden } as never)
    .eq("id", id)
    .eq("event_id", eventId);

  if (error) {
    console.error("Failed to update dashboard photo visibility", {
      photoId: id,
      eventId,
      message: error.message,
    });
    return NextResponse.json({ error: "Failed to update photo" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const eventId = String(body?.eventId || "");
  const storagePath = String(body?.storagePath || "");

  if (!eventId || !storagePath) {
    return NextResponse.json({ error: "Missing photo details" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const ownerCheck = await verifyEventOwner(supabase, eventId);

  if (ownerCheck) return ownerCheck;

  const { error: storageError } = await supabase.storage.from(PHOTO_BUCKET).remove([storagePath]);

  if (storageError) {
    console.error("Failed to remove dashboard photo from storage", {
      photoId: id,
      eventId,
      storagePath,
      message: storageError.message,
    });
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }

  const { error: deleteError } = await supabase
    .from("photos")
    .delete()
    .eq("id", id)
    .eq("event_id", eventId);

  if (deleteError) {
    console.error("Failed to delete dashboard photo row", {
      photoId: id,
      eventId,
      storagePath,
      message: deleteError.message,
    });
    return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

async function verifyEventOwner(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  eventId: string,
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: event, error } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Failed to verify dashboard photo owner", {
      eventId,
      message: error.message,
    });
    return NextResponse.json({ error: "Failed to verify event owner" }, { status: 500 });
  }

  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return null;
}
