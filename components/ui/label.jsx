"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

// Labels render in the eyebrow style (uppercase, wide tracking) above inputs.
const Label = React.forwardRef(function Label({ className, ...props }, ref) {
  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn("eyebrow block peer-disabled:opacity-70", className)}
      {...props}
    />
  );
});

export { Label };
