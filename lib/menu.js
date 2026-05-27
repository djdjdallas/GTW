import { createClient } from "@/lib/supabase/server";

/*
  The 8 launch juices, mirrored from supabase/seed.sql. We keep a local copy so
  the marketing pages still render during local development before Supabase is
  configured, or if the network call fails. When Supabase is reachable the live
  rows win (they carry real ids needed for ordering).
*/
export const SEED_DRINKS = [
  { id: "seed-1", name: "Strawberry Bliss", description: "Sweet and creamy, perfect any time of day", ingredients: ["Strawberry", "Banana", "Almond milk", "Honey"], price_cents: 800, credit_cost: 1, color_hex: "#ED93B1", text_color_hex: "#4B1528", tag: "Fresh today", tier_required: null, display_order: 1 },
  { id: "seed-2", name: "Sunrise Mango", description: "Tropical kickstart with anti-inflammatory turmeric", ingredients: ["Mango", "Pineapple", "Ginger", "Turmeric"], price_cents: 900, credit_cost: 1, color_hex: "#EF9F27", text_color_hex: "#412402", tag: "Energy boost", tier_required: null, display_order: 2 },
  { id: "seed-3", name: "Kiwi Crush", description: "Greens forward but actually delicious", ingredients: ["Kiwi", "Spinach", "Apple", "Lime"], price_cents: 850, credit_cost: 1, color_hex: "#97C459", text_color_hex: "#173404", tag: "Greens forward", tier_required: null, display_order: 3 },
  { id: "seed-4", name: "Berry Forest", description: "Antioxidant powerhouse with deep berry notes", ingredients: ["Blueberry", "Blackberry", "Acai", "Fresh mint"], price_cents: 950, credit_cost: 1, color_hex: "#AFA9EC", text_color_hex: "#26215C", tag: "Antioxidant", tier_required: null, display_order: 4 },
  { id: "seed-5", name: "Watermelon Wave", description: "Hydration with a savory twist", ingredients: ["Watermelon", "Basil", "Lime", "Sea salt"], price_cents: 750, credit_cost: 1, color_hex: "#F0997B", text_color_hex: "#4A1B0C", tag: "Hydration", tier_required: null, display_order: 5 },
  { id: "seed-6", name: "Apple Mint Reset", description: "Clean greens for a fresh start", ingredients: ["Green apple", "Cucumber", "Mint", "Celery"], price_cents: 800, credit_cost: 1, color_hex: "#5DCAA5", text_color_hex: "#04342C", tag: "Clean start", tier_required: null, display_order: 6 },
  { id: "seed-7", name: "Pineapple Glow", description: "Immunity blend with a kick of ginger", ingredients: ["Pineapple", "Carrot", "Ginger", "Lemon"], price_cents: 850, credit_cost: 1, color_hex: "#FAC775", text_color_hex: "#412402", tag: "Immunity", tier_required: null, display_order: 7 },
  { id: "seed-8", name: "Acai Power", description: "Premium bowl style with raw honey and crunch", ingredients: ["Acai", "Banana", "Granola", "Raw honey"], price_cents: 1000, credit_cost: 2, color_hex: "#534AB7", text_color_hex: "#EEEDFE", tag: "Premium", tier_required: null, display_order: 8 },
];

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
