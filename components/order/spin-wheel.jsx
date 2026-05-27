"use client";

import { AnimatePresence, motion } from "framer-motion";
import { RotateCw } from "lucide-react";

/*
  The spin wheel mirrors the mobile ordering UI: one juice fills a large circle at
  a time. Tapping spin advances to the next juice. The outgoing juice rotates up
  and out while the next rotates in from below, giving the wheel-turning feel.
  Colors come from each drink's color_hex so the circle matches the product.
*/
export function SpinWheel({ drinks, index, onSpin }) {
  const drink = drinks[index];
  if (!drink) return null;

  return (
    <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center sm:gap-10">
      <div className="relative h-72 w-72 sm:h-80 sm:w-80">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={drink.id}
            initial={{ rotate: -12, y: 120, opacity: 0, scale: 0.9 }}
            animate={{ rotate: 0, y: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 12, y: -120, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            className="absolute inset-0 flex flex-col items-center justify-center rounded-full p-8 text-center"
            style={{ backgroundColor: drink.color_hex || "#f1eee6" }}
          >
            {drink.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={drink.image_url}
                alt={drink.name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span
                className="font-display text-3xl leading-tight"
                style={{ color: drink.text_color_hex || "#0a0a0a" }}
              >
                {drink.name}
              </span>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        onClick={onSpin}
        aria-label="Spin to next juice"
        className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-[var(--brand-forest-hover)]"
      >
        <RotateCw className="h-7 w-7" />
      </button>
    </div>
  );
}
