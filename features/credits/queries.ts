import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function getCreditAmount(userId: string) {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("credits").select("amount").eq("user_id", userId).single();
  return (data as any)?.amount ?? 0;
}
