/*
  The 8 launch juices, mirrored from supabase/seed.sql. Kept in its own module
  (no server-only imports) so both server code (lib/menu.js) and client
  components (home-spin-wheel.jsx) can use it as a fallback when Supabase is
  unreachable. When Supabase is reachable the live rows win.
*/
export const SEED_DRINKS = [
  { id: "seed-1", name: "Strawberry Bliss", description: "Sweet and creamy, perfect any time of day", ingredients: ["Strawberry", "Banana", "Almond milk", "Honey"], price_cents: 800, credit_cost: 1, color_hex: "#ED93B1", text_color_hex: "#4B1528", tag: "Fresh today", tier_required: null, display_order: 1, image_url: "/assets/strawberry.png" },
  { id: "seed-2", name: "Sunrise Mango", description: "Tropical kickstart with anti-inflammatory turmeric", ingredients: ["Mango", "Pineapple", "Ginger", "Turmeric"], price_cents: 900, credit_cost: 1, color_hex: "#EF9F27", text_color_hex: "#412402", tag: "Energy boost", tier_required: null, display_order: 2, image_url: "/assets/mango.png" },
  { id: "seed-3", name: "Kiwi Crush", description: "Greens forward but actually delicious", ingredients: ["Kiwi", "Spinach", "Apple", "Lime"], price_cents: 850, credit_cost: 1, color_hex: "#97C459", text_color_hex: "#173404", tag: "Greens forward", tier_required: null, display_order: 3, image_url: "/assets/green.png" },
  { id: "seed-4", name: "Berry Forest", description: "Antioxidant powerhouse with deep berry notes", ingredients: ["Blueberry", "Blackberry", "Acai", "Fresh mint"], price_cents: 950, credit_cost: 1, color_hex: "#AFA9EC", text_color_hex: "#26215C", tag: "Antioxidant", tier_required: null, display_order: 4, image_url: "/assets/blueberry.png" },
  { id: "seed-5", name: "Watermelon Wave", description: "Hydration with a savory twist", ingredients: ["Watermelon", "Basil", "Lime", "Sea salt"], price_cents: 750, credit_cost: 1, color_hex: "#F0997B", text_color_hex: "#4A1B0C", tag: "Hydration", tier_required: null, display_order: 5, image_url: "/assets/watermelon.png" },
  { id: "seed-6", name: "Apple Mint Reset", description: "Clean greens for a fresh start", ingredients: ["Green apple", "Cucumber", "Mint", "Celery"], price_cents: 800, credit_cost: 1, color_hex: "#5DCAA5", text_color_hex: "#04342C", tag: "Clean start", tier_required: null, display_order: 6, image_url: "/assets/apple.png" },
  { id: "seed-7", name: "Pineapple Glow", description: "Immunity blend with a kick of ginger", ingredients: ["Pineapple", "Carrot", "Ginger", "Lemon"], price_cents: 850, credit_cost: 1, color_hex: "#FAC775", text_color_hex: "#412402", tag: "Immunity", tier_required: null, display_order: 7, image_url: "/assets/pineapple.png" },
  { id: "seed-8", name: "Acai Power", description: "Premium bowl style with raw honey and crunch", ingredients: ["Acai", "Banana", "Granola", "Raw honey"], price_cents: 1000, credit_cost: 2, color_hex: "#534AB7", text_color_hex: "#EEEDFE", tag: "Premium", tier_required: null, display_order: 8, image_url: "/assets/acai.png" },
];
