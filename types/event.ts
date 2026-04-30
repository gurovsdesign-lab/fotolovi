import type { Database } from "./database";

export type Event = Database["public"]["Tables"]["events"]["Row"];

export type EventWithPhotoCount = Event & {
  photos_count: number;
};
