import type { Database } from "./database";

export type SpotlightParticipant = Database["public"]["Tables"]["spotlight_participants"]["Row"];

export type SpotlightParticipantPhoto =
  Database["public"]["Tables"]["spotlight_participant_photos"]["Row"];

export type LiveScreenState = Database["public"]["Tables"]["live_screen_states"]["Row"];

export type SpotlightParticipantWithPhotos = SpotlightParticipant & {
  photos: SpotlightParticipantPhoto[];
};

export type LiveScreenStateWithParticipant = LiveScreenState & {
  participant: SpotlightParticipant | null;
};
