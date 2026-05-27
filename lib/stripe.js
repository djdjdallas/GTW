import Stripe from "stripe";

// Server-side Stripe client. Never import this into a client component: it
// carries the secret key. Pin the API version for predictable webhook payloads.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
  typescript: false,
});
