"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Wordmark } from "@/components/marketing/wordmark";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SpinWheel } from "@/components/order/spin-wheel";
import { CartDrawer } from "@/components/order/cart-drawer";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";

export function OrderExperience({
  userId,
  drinks,
  tierName,
  creditsRemaining,
  unlimited,
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [items, setItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [placing, setPlacing] = useState(false);

  if (!drinks || drinks.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-6 text-center">
        <p className="text-muted-foreground">
          No juices are available for your tier right now. Check back soon.
        </p>
      </div>
    );
  }

  const current = drinks[index];
  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  function spin() {
    setIndex((i) => (i + 1) % drinks.length);
  }

  function addToOrder() {
    setItems((prev) => {
      const existing = prev.find((i) => i.drink_id === current.id);
      if (existing) {
        return prev.map((i) =>
          i.drink_id === current.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          drink_id: current.id,
          name: current.name,
          price_cents: current.price_cents,
          credit_cost: current.credit_cost,
          quantity: 1,
        },
      ];
    });
    toast.success(`${current.name} added`);
  }

  function removeItem(drinkId) {
    setItems((prev) => prev.filter((i) => i.drink_id !== drinkId));
  }

  async function placeOrder() {
    setPlacing(true);
    const supabase = createClient();
    // The place_order RPC deducts credits and inserts the order atomically, so a
    // single click can never double spend credits even on a flaky connection.
    const payload = items.map((i) => ({ drink_id: i.drink_id, quantity: i.quantity }));
    const { data, error } = await supabase.rpc("place_order", {
      p_user_id: userId,
      p_items: payload,
    });
    setPlacing(false);

    if (error) {
      toast.error("Could not place order", { description: error.message });
      return;
    }
    router.push(`/order/confirm/${data}`);
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-border bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-4">
          <Wordmark />
          <div className="flex items-center gap-3">
            <Badge variant="secondary">{tierName}</Badge>
            <Badge>{unlimited ? "Unlimited" : `${creditsRemaining} credits`}</Badge>
            <Button variant="outline" size="sm" onClick={() => setCartOpen(true)}>
              <ShoppingBag className="h-4 w-4" />
              Order {cartCount > 0 ? `(${cartCount})` : ""}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-6 py-12">
        <p className="eyebrow mb-2">Spin to browse</p>
        <h1 className="font-display text-4xl">Build today's order</h1>

        <div className="mt-12 flex justify-center">
          <SpinWheel drinks={drinks} index={index} onSpin={spin} />
        </div>

        {/* Progress dots */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {drinks.map((d, i) => (
            <span
              key={d.id}
              className={`h-2 w-2 rounded-full ${i === index ? "bg-primary" : "bg-border"}`}
            />
          ))}
        </div>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          {index + 1} of {drinks.length}
        </p>

        {/* Drink detail */}
        <div className="mx-auto mt-10 max-w-md rounded-xl border border-border bg-card p-6 text-center">
          <h2 className="font-display text-3xl">{current.name}</h2>
          {current.description ? (
            <p className="mt-2 text-muted-foreground">{current.description}</p>
          ) : null}
          {current.ingredients?.length ? (
            <p className="mt-3 text-sm text-muted-foreground">
              {current.ingredients.join(" . ")}
            </p>
          ) : null}
          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="text-lg font-medium">{formatPrice(current.price_cents)}</span>
            <Badge variant="secondary">
              {current.credit_cost} {current.credit_cost === 1 ? "credit" : "credits"}
            </Badge>
          </div>
          <Button className="mt-6 w-full" size="lg" onClick={addToOrder}>
            Add to order
          </Button>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Prefer ordering on the go?{" "}
          <Link href="/dashboard" className="text-primary underline underline-offset-4">
            Back to dashboard
          </Link>
        </p>
      </main>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={items}
        onRemove={removeItem}
        onPlace={placeOrder}
        placing={placing}
        unlimited={unlimited}
      />
    </div>
  );
}
