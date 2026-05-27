# Green The World Juice

The public web app for Green The World Juice: a premium daily juice subscription.
It handles the marketing site, signup and auth (Supabase), subscription purchase
(Stripe Checkout), the Stripe webhook that syncs state into Supabase, the member
dashboard, the Stripe Customer Portal, and a web based spin wheel ordering flow.

Built with Next.js 15 (App Router, JavaScript only), Tailwind CSS v4,
shadcn style components, Supabase, Stripe, and Framer Motion.

## Stack

- Next.js 15, App Router, JavaScript (no TypeScript)
- Tailwind CSS v4 with brand tokens in `app/globals.css`
- shadcn style UI components in `components/ui`
- `@supabase/supabase-js` and `@supabase/ssr`
- `stripe` server SDK
- `framer-motion` for the spin wheel
- `qrcode` for redemption QR codes

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template and fill in values:

   ```bash
   cp .env.example .env.local
   ```

3. Run the dev server:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000. The marketing pages render with a built in seed
   menu even before Supabase is configured, so you can style without a database.

## Supabase setup

The database schema lives in `supabase/migrations` and `supabase/seed.sql`.

```bash
# Local dev stack
supabase init      # only the first time
supabase start
supabase db reset  # applies the migration and seeds the menu

# Or against a linked remote project
supabase link --project-ref <your-ref>
supabase db push
```

After applying, the `drinks` table has 8 rows, RLS is enabled on all user data
tables, and the `place_order`, `reset_credits_for_period`, and `complete_order`
functions are available. See `docs/database.md` for a full table reference.

## Stripe setup

1. Create 5 recurring monthly prices in the Stripe Dashboard (one per tier) and
   put their ids in `.env.local` as `STRIPE_PRICE_SIP` ... `STRIPE_PRICE_FOUNDERS`.
2. Add `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
3. Forward webhooks locally with the Stripe CLI:

   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

   Copy the signing secret it prints into `STRIPE_WEBHOOK_SECRET`. In production,
   create a webhook endpoint pointing at `https://your-domain/api/webhooks/stripe`
   and subscribe to `checkout.session.completed`,
   `customer.subscription.updated`, `customer.subscription.deleted`,
   `invoice.payment_succeeded`, and `invoice.payment_failed`.

## Environment variables

See `.env.example`. The `SUPABASE_SERVICE_ROLE_KEY` is used only by server side
API routes (checkout, billing portal, webhook) and must never be exposed to the
browser.

## Deploy

Deploy to Vercel. Set every variable from `.env.example` in the project settings,
and set `NEXT_PUBLIC_WEB_URL` to the production domain so Stripe redirect URLs and
the sitemap resolve correctly.
