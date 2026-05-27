import * as React from "react";
import { cn } from "@/lib/utils";

// Brand inputs are border-bottom only, 48px tall, focus turns the underline forest green.
const Input = React.forwardRef(function Input({ className, type = "text", ...props }, ref) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "h-12 w-full border-0 border-b border-border bg-transparent px-1 py-2 text-base text-foreground placeholder:text-muted-foreground/70 transition-colors focus-visible:border-b-2 focus-visible:border-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});

export { Input };
