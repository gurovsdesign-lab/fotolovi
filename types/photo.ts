import type { Database } from "./database";

export type Photo = Database["public"]["Tables"]["photos"]["Row"];

export type DashboardPhoto = Photo & {
  dashboard_state?: "deleted";
};
