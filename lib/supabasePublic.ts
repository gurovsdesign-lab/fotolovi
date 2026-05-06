import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export function createPublicSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Public Supabase env variables are missing.");
  }

  if (anonKey.startsWith("sb_secret_")) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY must be a public anon/publishable key.");
  }

  return createClient<Database>(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    },
  });
}
