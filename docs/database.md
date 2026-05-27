# Database overview

The shared Supabase backend for Green The World Juice. Two frontends read and
write here: the Next.js web app (this repo) and the Expo mobile app. Stripe never
touches the database directly. Instead the web app's Stripe webhook writes
subscription state using the service role key.

## Tables

| Table | Purpose | Web app | Mobile app |
| --- | --- | --- | --- |
| `profiles` | Display name and phone, extends `auth.users`. Auto created on signup. | read, update | read, update |
| `subscriptions` | One row per user. Stripe customer and subscription ids, current tier, status, period. | read (write via service role webhook only) | read |
| `credit_balances` | One row per user. Credits remaining this period, unlimited window for Crew and Founders. | read (write via functions / service role) | read |
| `drinks` | The 8 juice menu. Publicly readable. | read | read |
| `orders` | Placed orders with a unique `redemption_code` for shop pickup. | read (insert via `place_order`) | read (insert via `place_order`) |
| `order_items` | Line items per order, with price and credit cost snapshotted. | read | read |
| `lucky_spins` | Daily free spin reward, one row per user per day. | read, insert | read, insert |

## Row Level Security

RLS is enabled on all 7 tables. Users can only ever select their own rows
(`auth.uid() = user_id`), except `drinks` which is publicly readable when
`is_active = true`. There is no user facing write policy on `subscriptions` or
`credit_balances`: those are mutated only by SECURITY DEFINER functions or the
service role, which is how we keep billing and credit state tamper proof.

## Functions

| Function | Trigger / caller | What it does |
| --- | --- | --- |
| `handle_new_user()` | Trigger on `auth.users` insert | Creates the profile and a zero balance credit row. |
| `place_order(p_user_id, p_items)` | Called by both apps (authenticated) | Atomically prices the order, deducts credits with `SELECT FOR UPDATE`, and inserts the order plus items. Rejects insufficient credits. |
| `reset_credits_for_period(p_user_id, p_period_end)` | Called by the Stripe webhook (service role) | Resets credits to the tier amount, or sets `unlimited_until` for Crew and Founders. |
| `complete_order(p_redemption_code)` | Shop staff via service role / admin | Marks a pending or ready order completed if not expired. |

## Why credit deduction is atomic

A user could tap "place order" twice, or order from web and mobile at the same
moment. `place_order` takes a row lock on the credit balance with `SELECT FOR
UPDATE`, so the second transaction waits for the first to commit and then sees
the updated balance. This prevents double spending a single credit.
