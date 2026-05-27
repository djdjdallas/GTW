import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

/*
  Visual drink card. When no photo is set we fall back to an editorial color
  block using the juice's own color_hex, which matches the spin wheel palette.
*/
export function DrinkCard({ drink }) {
  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-card">
      <div
        className="relative flex aspect-square items-end justify-start overflow-hidden p-5"
        style={{ backgroundColor: drink.color_hex || "#f1eee6" }}
      >
        {/* Bottle photo centered on the juice color. The color shows around the
            edges so each card keeps its identity, and stays as the fallback if
            the photo is missing. object-contain keeps the whole bottle visible.
            (No client-side error handler here: this is a Server Component, so
            DOM event handlers can't be attached.) */}
        {drink.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={drink.image_url}
            alt={drink.name}
            className="absolute inset-0 z-0 m-auto h-[88%] w-auto object-contain"
          />
        ) : null}
        {drink.tag ? (
          <span
            className="relative z-10 rounded-full bg-white/85 px-3 py-1 text-xs font-medium"
            style={{ color: drink.text_color_hex || "#0a0a0a" }}
          >
            {drink.tag}
          </span>
        ) : null}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl">{drink.name}</h3>
          <span className="whitespace-nowrap text-sm font-medium">
            {formatPrice(drink.price_cents)}
          </span>
        </div>
        {drink.description ? (
          <p className="mt-1 text-sm text-muted-foreground">{drink.description}</p>
        ) : null}
        {drink.ingredients?.length ? (
          <p className="mt-3 text-xs text-muted-foreground">
            {drink.ingredients.join(" . ")}
          </p>
        ) : null}
        <div className="mt-4 flex items-center gap-2">
          <Badge variant="secondary">
            {drink.credit_cost} {drink.credit_cost === 1 ? "credit" : "credits"}
          </Badge>
          {drink.tier_required ? (
            <Badge variant="outline" className="capitalize">
              {drink.tier_required}+
            </Badge>
          ) : null}
        </div>
      </div>
    </div>
  );
}
