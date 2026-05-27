"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ManageBillingButton({ children = "Manage billing", ...props }) {
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing-portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Could not open portal");
      window.location.href = data.url;
    } catch (err) {
      toast.error("Billing portal unavailable", { description: err.message });
      setLoading(false);
    }
  }

  return (
    <Button onClick={openPortal} disabled={loading} {...props}>
      {loading ? "Opening..." : children}
    </Button>
  );
}
