import { NextResponse } from "next/server";
import { getLiveScreenPhotos } from "@/features/live/queries";
import { createServiceRoleSupabaseClient } from "@/lib/supabaseService";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createServiceRoleSupabaseClient();
  const { data: event, error } = await supabase
    .from("events")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Failed to load event photos API event via service role", {
      slug,
      message: error.message,
    });
    return NextResponse.json({ photos: [] });
  }

  const liveEvent = event as { id: string } | null;

  if (!liveEvent) {
    return NextResponse.json({ photos: [] }, { status: 404 });
  }

  const photos = await getLiveScreenPhotos(liveEvent.id);

  return NextResponse.json({ photos });
}
