import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/utils";

// One row summarizing an order. Used in the overview and full history lists.
export function OrderRow({ order }) {
  const items = order.order_items || [];
  const summary = items
    .map((i) => `${i.quantity > 1 ? i.quantity + "x " : ""}${i.drink_name_snapshot}`)
    .join(", ");

  return (
    <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium">{summary || "Order"}</p>
        <p className="text-sm text-muted-foreground">
          {formatDate(order.created_at)} . Code {order.redemption_code}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          {order.credits_used} {order.credits_used === 1 ? "credit" : "credits"}
        </span>
        <span className="text-sm">{formatPrice(order.total_cents)}</span>
        <Badge variant={order.status}>{order.status}</Badge>
      </div>
    </div>
  );
}
