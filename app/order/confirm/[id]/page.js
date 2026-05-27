import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Wordmark } from "@/components/marketing/wordmark";
import { QrCode } from "@/components/qr-code";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Order confirmed" };

export default async function OrderConfirmPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  // RLS guarantees this returns the order only if it belongs to the current user.
  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .maybeSingle();

  if (!order) notFound();

  const items = order.order_items || [];

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-[1100px] px-6 py-4">
          <Wordmark />
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-6 py-12 text-center">
        <Badge variant={order.status} className="capitalize">
          {order.status}
        </Badge>
        <h1 className="mt-4 font-display text-4xl">Order confirmed.</h1>
        <p className="mt-2 text-muted-foreground">
          Show this code at the counter to pick up your juice.
        </p>

        <div className="mt-8 flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8">
          <QrCode value={order.redemption_code} size={220} />
          <p className="font-mono text-2xl tracking-[0.3em] text-primary">
            {order.redemption_code}
          </p>
          <p className="text-sm font-medium">Show this code at the counter</p>
        </div>

        <div className="mt-8 rounded-xl border border-border bg-card p-6 text-left">
          <h2 className="font-display text-2xl">Your juices</h2>
          <ul className="mt-4 space-y-2">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between text-sm">
                <span>
                  {i.quantity > 1 ? `${i.quantity}x ` : ""}
                  {i.drink_name_snapshot}
                </span>
                <span className="text-muted-foreground">
                  {formatPrice(i.price_cents_snapshot * i.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-border pt-4 text-sm font-medium">
            <span>Total</span>
            <span>{formatPrice(order.total_cents)}</span>
          </div>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Pickup at the Green The World shop. Orders expire 24 hours after they are
          placed.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Button asChild size="lg">
            <Link href="/order">Place another order</Link>
          </Button>
          <Button asChild variant="link">
            <Link href="/dashboard/orders">View all orders</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
