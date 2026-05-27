import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-border bg-secondary text-secondary-foreground",
        outline: "border-primary text-primary",
        terracotta: "border-transparent bg-[var(--brand-terracotta)] text-white",
        // Order status colors per the dashboard spec.
        pending: "border-transparent bg-amber-100 text-amber-800",
        ready: "border-transparent bg-blue-100 text-blue-800",
        completed: "border-transparent bg-green-100 text-green-800",
        canceled: "border-transparent bg-gray-100 text-gray-600",
        expired: "border-transparent bg-gray-100 text-gray-500",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
