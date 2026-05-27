"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

export function FaqAccordion({ items }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="divide-y divide-border border-y border-border">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
            >
              <span className="text-lg font-medium">{item.q}</span>
              {isOpen ? (
                <Minus className="h-5 w-5 shrink-0 text-primary" />
              ) : (
                <Plus className="h-5 w-5 shrink-0 text-primary" />
              )}
            </button>
            {isOpen && (
              <p className="pb-6 pr-8 text-muted-foreground">{item.a}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
