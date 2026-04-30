import type { Database } from "./database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type CreditBalance = Database["public"]["Tables"]["credits"]["Row"];
