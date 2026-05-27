import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode } from "@/components/qr-code";
import { formatPrice, formatDate } from "@/lib/utils";

export const metadata = { title: "Order history" };

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <p className="eyebrow mb-2">History</p>
      <h1 className="font-display text-4xl">Your orders</h1>

      {!orders || orders.length === 0 ? (
        <p className="mt-8 text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="mt-8 flex flex-col gap-4">
          {orders.map((order) => {
            const showQr = ["pending", "ready"].includes(order.status);
            const items = order.order_items || [];
            return (
              <Card key={order.id}>
                <CardContent className="flex flex-col gap-6 py-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Badge variant={order.status}>{order.status}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(order.created_at)}
                      </span>
                    </div>
                    <ul className="mt-4 space-y-1 text-sm">
                      {items.map((i) => (
                        <li key={i.id} className="flex justify-between gap-4">
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
                    <div className="mt-4 flex items-center gap-4 text-sm">
                      <span className="font-medium">{formatPrice(order.total_cents)}</span>
                      <span className="text-muted-foreground">
                        {order.credits_used} {order.credits_used === 1 ? "credit" : "credits"}
                      </span>
                    </div>
                  </div>

                  {showQr ? (
                    <div className="flex flex-col items-center gap-2 sm:border-l sm:border-border sm:pl-6">
                      <QrCode value={order.redemption_code} size={140} />
                      <p className="font-mono text-sm tracking-widest">
                        {order.redemption_code}
                      </p>
                      <p className="text-xs text-muted-foreground">Show at counter</p>
                    </div>
                  ) : (
                    <p className="font-mono text-sm text-muted-foreground">
                      {order.redemption_code}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
