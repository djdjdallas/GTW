import Stripe from "stripe";

// Server-side Stripe client. Never import this into a client component: it
// carries the secret key. Pin the API version for predictable webhook payloads.
//
// Instantiation is lazy: the real client is created on first property access,
// not at module load. This lets `next build` import the API routes that use it
// without STRIPE_SECRET_KEY present (page-data collection only evaluates module
// scope). The key is only required when a request actually touches Stripe.
let client;

function getStripe() {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error(
        "STRIPE_SECRET_KEY is not set. Add it to your environment to use Stripe."
      );
    }
    client = new Stripe(key, { apiVersion: "2024-06-20", typescript: false });
  }
  return client;
}

export const stripe = new Proxy(
  {},
  {
    get(_target, prop) {
      const value = getStripe()[prop];
      return typeof value === "function" ? value.bind(getStripe()) : value;
    },
  }
);
