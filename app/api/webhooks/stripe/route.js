import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { tierFromPriceId } from "@/lib/tiers";

/*
  Stripe webhook. This is the single point where subscription state flows into
  Supabase. It runs with the service role so it can write the subscriptions and
  credit_balances tables that users cannot write directly (RLS).

  Idempotency: every handler is an upsert keyed on user_id, and credit resets are
  driven by the period end. Stripe may deliver an event more than once, so the
  handlers are written to be safe to replay.
*/
export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription
        );
        const userId =
          session.client_reference_id ||
          subscription.metadata?.supabase_user_id ||
          (await userIdFromCustomer(admin, session.customer));

        if (userId) {
          const tier = tierForSubscription(subscription);
          const periodEnd = periodEndOf(subscription);
          await admin.from("subscriptions").upsert(
            {
              user_id: userId,
              stripe_customer_id: session.customer,
              stripe_subscription_id: subscription.id,
              tier,
              status: subscription.status,
              current_period_start: tsOf(subscription.current_period_start),
              current_period_end: periodEnd,
              cancel_at_period_end: subscription.cancel_at_period_end,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );

          // Grant the first period of credits immediately on activation.
          await admin.rpc("reset_credits_for_period", {
            p_user_id: userId,
            p_period_end: periodEnd,
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const userId =
          subscription.metadata?.supabase_user_id ||
          (await userIdFromCustomer(admin, subscription.customer));

        if (userId) {
          const newTier = tierForSubscription(subscription);
          const periodEnd = periodEndOf(subscription);

          const { data: prev } = await admin
            .from("subscriptions")
            .select("tier")
            .eq("user_id", userId)
            .maybeSingle();

          await admin.from("subscriptions").upsert(
            {
              user_id: userId,
              stripe_customer_id: subscription.customer,
              stripe_subscription_id: subscription.id,
              tier: newTier,
              status: subscription.status,
              current_period_end: periodEnd,
              cancel_at_period_end: subscription.cancel_at_period_end,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );

          // Only re-grant credits when the tier actually changed (upgrade or
          // downgrade), so a plain renewal does not double up via this event.
          if (prev?.tier !== newTier) {
            await admin.rpc("reset_credits_for_period", {
              p_user_id: userId,
              p_period_end: periodEnd,
            });
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const userId =
          subscription.metadata?.supabase_user_id ||
          (await userIdFromCustomer(admin, subscription.customer));
        if (userId) {
          await admin
            .from("subscriptions")
            .update({ status: "canceled", updated_at: new Date().toISOString() })
            .eq("user_id", userId);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const userId = await userIdFromCustomer(admin, invoice.customer);
        if (userId) {
          // Resolve the new period end from the subscription on the invoice.
          let periodEnd = null;
          if (invoice.subscription) {
            const subscription = await stripe.subscriptions.retrieve(
              invoice.subscription
            );
            periodEnd = periodEndOf(subscription);
            await admin
              .from("subscriptions")
              .update({
                status: subscription.status,
                current_period_end: periodEnd,
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", userId);
          }
          await admin.rpc("reset_credits_for_period", {
            p_user_id: userId,
            p_period_end: periodEnd,
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const userId = await userIdFromCustomer(admin, invoice.customer);
        if (userId) {
          await admin
            .from("subscriptions")
            .update({ status: "past_due", updated_at: new Date().toISOString() })
            .eq("user_id", userId);
        }
        break;
      }

      default:
        // Any event we do not handle is acknowledged so Stripe stops retrying.
        break;
    }
  } catch (err) {
    // Returning 500 tells Stripe to retry, which is what we want on a transient
    // database error.
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// Helpers ---------------------------------------------------------------

function tierForSubscription(subscription) {
  const priceId = subscription.items?.data?.[0]?.price?.id;
  return tierFromPriceId(priceId) || subscription.metadata?.tier || null;
}

function periodEndOf(subscription) {
  return tsOf(subscription.current_period_end);
}

function tsOf(unixSeconds) {
  return unixSeconds ? new Date(unixSeconds * 1000).toISOString() : null;
}

async function userIdFromCustomer(admin, customerId) {
  if (!customerId) return null;
  const { data } = await admin
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return data?.user_id || null;
}
