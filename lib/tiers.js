/*
  Single source of truth for the 5 subscription tiers. The Stripe price IDs come
  from env vars so the same code runs against test and live Stripe accounts.
  The marketing and pricing pages also read the perk copy from here so the
  tier definitions never drift between checkout and display.
*/
export const TIER_ORDER = ["sip", "refresh", "daily", "crew", "founders"];

export const TIERS = {
  sip: {
    id: "sip",
    priceId: process.env.STRIPE_PRICE_SIP,
    name: "Sip",
    price: 10,
    credits: 4,
    unlimited: false,
    tagline: "A taste of the ritual",
    perks: ["4 credits a month", "10% off extra juices", "Basic juices only"],
  },
  refresh: {
    id: "refresh",
    priceId: process.env.STRIPE_PRICE_REFRESH,
    name: "Refresh",
    price: 20,
    credits: 8,
    unlimited: false,
    tagline: "Twice a week, every week",
    perks: ["8 credits a month", "15% off extras", "Free size upgrade"],
  },
  daily: {
    id: "daily",
    priceId: process.env.STRIPE_PRICE_DAILY,
    name: "Daily",
    price: 35,
    credits: 20,
    unlimited: false,
    popular: true,
    tagline: "The everyday habit",
    perks: [
      "20 credits a month",
      "20% off extras",
      "Weekend access",
      "5 credit rollover",
    ],
  },
  crew: {
    id: "crew",
    priceId: process.env.STRIPE_PRICE_CREW,
    name: "Crew",
    price: 50,
    unlimited: true,
    tagline: "Unlimited weekdays",
    perks: [
      "Unlimited weekdays",
      "25% off weekends",
      "Monthly merch perk",
      "Premium add-ons",
    ],
  },
  founders: {
    id: "founders",
    priceId: process.env.STRIPE_PRICE_FOUNDERS,
    name: "Founders",
    price: 75,
    unlimited: true,
    tagline: "Everything, any day",
    perks: [
      "Unlimited any day",
      "Early access to seasonal drinks",
      "Monthly signature bottle",
      "2 guest passes",
    ],
  },
};

export function tierFromPriceId(priceId) {
  return Object.entries(TIERS).find(([, tier]) => tier.priceId === priceId)?.[0];
}
