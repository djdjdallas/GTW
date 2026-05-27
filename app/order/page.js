import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OrderExperience } from "@/components/order/order-experience";
import { TIER_ORDER, TIERS } from "@/lib/tiers";

export const metadata = { title: "Order" };

export default async function OrderPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("tier, status")
    .eq("user_id", user.id)
    .maybeSingle();

  const isActive =
    subscription && ["active", "trialing"].includes(subscription.status);

  // Ordering requires an active membership. Without one, send to pricing.
  if (!isActive) {
    redirect("/pricing");
  }

  const { data: balance } = await supabase
    .from("credit_balances")
    .select("credits_remaining, unlimited_until")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: drinks } = await supabase
    .from("drinks")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  // Only show drinks the member's tier can order. tier_required null is open to all.
  const userRank = TIER_ORDER.indexOf(subscription.tier);
  const available = (drinks || []).filter((d) => {
    if (!d.tier_required) return true;
    return TIER_ORDER.indexOf(d.tier_required) <= userRank;
  });

  const unlimited =
    balance?.unlimited_until && new Date(balance.unlimited_until) > new Date();

  return (
    <OrderExperience
      userId={user.id}
      drinks={available}
      tierName={TIERS[subscription.tier]?.name || subscription.tier}
      creditsRemaining={balance?.credits_remaining ?? 0}
      unlimited={!!unlimited}
    />
  );
}
