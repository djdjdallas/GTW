"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";

// Slides out from the right with the current order. Mirrors the mobile cart.
export function CartDrawer({ open, onClose, items, onRemove, onPlace, placing, unlimited }) {
  const totalCents = items.reduce((s, i) => s + i.price_cents * i.quantity, 0);
  const totalCredits = items.reduce((s, i) => s + i.credit_cost * i.quantity, 0);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-card"
          >
            <div className="flex items-center justify-between border-b border-border p-5">
              <h2 className="font-display text-2xl">Your order</h2>
              <button onClick={onClose} aria-label="Close cart">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {items.length === 0 ? (
                <p className="text-muted-foreground">Your order is empty. Add a juice from the wheel.</p>
              ) : (
                <ul className="flex flex-col gap-4">
                  {items.map((item) => (
                    <li key={item.drink_id} className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">
                          {item.quantity > 1 ? `${item.quantity}x ` : ""}
                          {item.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(item.price_cents)} . {item.credit_cost}{" "}
                          {item.credit_cost === 1 ? "credit" : "credits"}
                        </p>
                      </div>
                      <button
                        onClick={() => onRemove(item.drink_id)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-border p-5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(totalCents)}</span>
              </div>
              <div className="mt-1 flex justify-between text-sm">
                <span className="text-muted-foreground">Credits used</span>
                <span>{unlimited ? "0 (unlimited)" : totalCredits}</span>
              </div>
              <Separator className="my-4" />
              <Button
                className="w-full"
                size="lg"
                disabled={items.length === 0 || placing}
                onClick={onPlace}
              >
                {placing ? "Placing order..." : "Place order"}
              </Button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
