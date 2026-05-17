import { createServerSupabaseClient } from "@/lib/supabaseServer";
import type {
  LiveScreenState,
  LiveScreenStateWithParticipant,
  SpotlightParticipant,
  SpotlightParticipantPhoto,
  SpotlightParticipantWithPhotos,
} from "@/types/spotlight";

type DbError = { message: string } | null;

type SelectResult<T> = Promise<{ data: T | null; error: DbError }>;
type SelectListResult<T> = Promise<{ data: T[] | null; error: DbError }>;

type SelectQuery<T> = {
  eq(column: string, value: string): SelectQuery<T>;
  in(column: string, values: string[]): SelectQuery<T>;
  order(column: string, options?: { ascending?: boolean }): SelectListResult<T>;
  maybeSingle(): SelectResult<T>;
};

type SelectTable<T> = {
  select(columns: string): SelectQuery<T>;
};

export async function getEventParticipantsWithPhotos(
  eventId: string,
): Promise<SpotlightParticipantWithPhotos[]> {
  const supabase = await createServerSupabaseClient();
  const participantsTable = supabase.from("spotlight_participants") as unknown as SelectTable<SpotlightParticipant>;
  const { data: participants, error } = await participantsTable
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error || !participants?.length) return [];

  const typedParticipants = participants as SpotlightParticipant[];
  const participantIds = typedParticipants.map((participant) => participant.id);
  const photosTable = supabase.from("spotlight_participant_photos") as unknown as SelectTable<SpotlightParticipantPhoto>;
  const { data: photos, error: photosError } = await photosTable
    .select("*")
    .eq("event_id", eventId)
    .in("participant_id", participantIds)
    .order("uploaded_at", { ascending: false });

  const photosByParticipant = new Map<string, SpotlightParticipantPhoto[]>();
  const typedPhotos = (photos ?? []) as SpotlightParticipantPhoto[];

  if (!photosError && typedPhotos.length) {
    typedPhotos.forEach((photo) => {
      const currentPhotos = photosByParticipant.get(photo.participant_id) ?? [];
      currentPhotos.push(photo);
      photosByParticipant.set(photo.participant_id, currentPhotos);
    });
  }

  return typedParticipants.map((participant) => ({
    ...participant,
    photos: photosByParticipant.get(participant.id) ?? [],
  }));
}

export async function getLiveScreenState(eventId: string): Promise<LiveScreenStateWithParticipant> {
  const supabase = await createServerSupabaseClient();
  const liveStatesTable = supabase.from("live_screen_states") as unknown as SelectTable<LiveScreenState>;
  const { data: state, error } = await liveStatesTable
    .select("*")
    .eq("event_id", eventId)
    .maybeSingle();

  if (error || !state) {
    return createDefaultLiveScreenState(eventId);
  }

  let participant: SpotlightParticipant | null = null;
  const typedState = state as LiveScreenState;

  if (typedState.active_participant_id) {
    const participantsTable = supabase.from("spotlight_participants") as unknown as SelectTable<SpotlightParticipant>;
    const { data } = await participantsTable
      .select("*")
      .eq("id", typedState.active_participant_id)
      .eq("event_id", eventId)
      .maybeSingle();

    participant = data ?? null;
  }

  if (typedState.mode === "spotlight" && !participant) {
    return createDefaultLiveScreenState(eventId);
  }

  return {
    ...typedState,
    participant,
  };
}

function createDefaultLiveScreenState(eventId: string): LiveScreenStateWithParticipant {
  return {
    event_id: eventId,
    mode: "live",
    active_participant_id: null,
    updated_by: null,
    updated_at: new Date(0).toISOString(),
    participant: null,
  };
}
