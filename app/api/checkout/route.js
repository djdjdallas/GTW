import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { TIERS } from "@/lib/tiers";

export async function POST(request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { tier } = await request.json();
  const tierConfig = TIERS[tier];
  if (!tierConfig || !tierConfig.priceId) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Reuse an existing Stripe customer for this user if we already created one,
  // otherwise create it and persist the id. Writing to subscriptions requires the
  // service role because RLS only grants users SELECT on their own subscription.
  const { data: existing } = await admin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  let customerId = existing?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;

    await admin
      .from("subscriptions")
      .upsert(
        { user_id: user.id, stripe_customer_id: customerId },
        { onConflict: "user_id" }
      );
  }

  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || new URL(request.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: tierConfig.priceId, quantity: 1 }],
    // client_reference_id lets the webhook tie the session back to our user even
    // if the customer mapping is ever lost.
    client_reference_id: user.id,
    subscription_data: { metadata: { supabase_user_id: user.id, tier } },
    success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/checkout/canceled`,
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
