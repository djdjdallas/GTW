import { createClient } from "@/lib/supabase/server";
import { SEED_DRINKS } from "@/lib/drinks-seed";

// Re-export so existing importers of `@/lib/menu` keep working. The data itself
// lives in lib/drinks-seed.js (no server-only imports) so client components can
// use it as a fallback too.
export { SEED_DRINKS };

export async function getDrinks() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("drinks")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) return SEED_DRINKS;
    return data;
  } catch {
    return SEED_DRINKS;
  }
}
