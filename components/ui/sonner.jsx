"use client";

import { Toaster as SonnerToaster } from "sonner";

// shadcn's current toast primitive is sonner. Styled to match the brand surfaces.
export function Toaster(props) {
  return (
    <SonnerToaster
      position="top-center"
      toastOptions={{
        classNames: {
          toast: "rounded-xl border border-border bg-card text-card-foreground",
          description: "text-muted-foreground",
        },
      }}
      {...props}
    />
  );
}
