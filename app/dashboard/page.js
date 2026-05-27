import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ManageBillingButton } from "@/components/dashboard/manage-billing-button";
import { OrderRow } from "@/components/dashboard/order-row";
import { TIERS } from "@/lib/tiers";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: subscription }, { data: balance }, { data: orders }] =
    await Promise.all([
      supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
      supabase.from("subscriptions").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("credit_balances").select("*").eq("user_id", user.id).maybeSingle(),
      supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const isActive =
    subscription && ["active", "trialing"].includes(subscription.status);
  const tierConfig = subscription?.tier ? TIERS[subscription.tier] : null;
  const unlimited =
    balance?.unlimited_until && new Date(balance.unlimited_until) > new Date();
  const firstName = (profile?.full_name || user.email || "").split(" ")[0];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Member dashboard</p>
          <h1 className="font-display text-4xl">
            {firstName ? `Hello, ${firstName}.` : "Hello."}
          </h1>
        </div>
        {isActive && <ManageBillingButton variant="outline" />}
      </div>

      {!isActive ? (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-start gap-4 py-8">
            <div>
              <h2 className="font-display text-2xl">No active plan yet</h2>
              <p className="mt-1 text-muted-foreground">
                {subscription?.status === "past_due"
                  ? "Your last payment did not go through. Update your billing to restore access."
                  : "Subscribe to start earning daily juice credits."}
              </p>
            </div>
            {subscription?.status === "past_due" ? (
              <ManageBillingButton>Update billing</ManageBillingButton>
            ) : (
              <Button asChild>
                <Link href="/pricing">See plans</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <Card>
            <CardContent className="py-6">
              <p className="eyebrow mb-3">Your tier</p>
              <Badge className="text-sm">{tierConfig?.name || subscription.tier}</Badge>
              <p className="mt-3 text-sm text-muted-foreground">
                {tierConfig?.tagline}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-6">
              <p className="eyebrow mb-3">Credits this period</p>
              <p className="font-display text-5xl text-primary">
                {unlimited ? "Unlimited" : (balance?.credits_remaining ?? 0)}
              </p>
              {!unlimited && balance?.credits_granted_this_period ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  of {balance.credits_granted_this_period} granted
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-6">
              <p className="eyebrow mb-3">Renews / resets</p>
              <p className="text-2xl font-medium">
                {formatDate(balance?.period_resets_at || subscription.current_period_end) || "Soon"}
              </p>
              {subscription.cancel_at_period_end ? (
                <p className="mt-2 text-sm text-terracotta">Cancels at period end</p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      )}

      {isActive && (
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/order">Order now</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/orders">View all orders</Link>
          </Button>
        </div>
      )}

      <div className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">Recent orders</h2>
          <Link href="/dashboard/orders" className="flex items-center gap-1 text-sm text-primary hover:underline">
            All orders <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {orders && orders.length > 0 ? (
          <div className="mt-4 divide-y divide-border border-t border-border">
            {orders.map((o) => (
              <OrderRow key={o.id} order={o} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-muted-foreground">No orders yet. Place your first one.</p>
        )}
      </div>
    </div>
  );
}
