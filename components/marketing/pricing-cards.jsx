"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TIER_ORDER, TIERS } from "@/lib/tiers";
import { cn } from "@/lib/utils";

/*
  Renders the 5 tier cards. The subscribe action depends on auth state, which is
  resolved on the server and passed in as isAuthed. Unauthenticated visitors are
  sent to signup with the chosen tier preserved so checkout resumes after signup.
*/
export function PricingCards({ isAuthed, currentTier }) {
  const router = useRouter();
  const [loading, setLoading] = useState(null);

  async function subscribe(tierKey) {
    if (!isAuthed) {
      router.push(`/signup?intent=subscribe&tier=${tierKey}`);
      return;
    }
    setLoading(tierKey);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: tierKey }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Checkout failed");
      window.location.href = data.url;
    } catch (err) {
      toast.error("Could not start checkout", { description: err.message });
      setLoading(null);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      {TIER_ORDER.map((key) => {
        const t = TIERS[key];
        const isCurrent = currentTier === key;
        return (
          <div
            key={key}
            className={cn(
              "relative flex flex-col rounded-xl border bg-card p-6",
              t.popular ? "border-primary" : "border-border"
            )}
          >
            {t.popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                Most popular
              </Badge>
            )}
            <h3 className="font-display text-3xl">{t.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t.tagline}</p>
            <p className="mt-5 text-4xl font-medium">
              ${t.price}
              <span className="text-base font-normal text-muted-foreground">/mo</span>
            </p>
            <p className="mt-2 text-sm font-medium text-primary">
              {t.unlimited ? "Unlimited orders" : `${t.credits} credits a month`}
            </p>

            <ul className="mt-6 flex flex-1 flex-col gap-3">
              {t.perks.map((perk) => (
                <li key={perk} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>

            <Button
              className="mt-7"
              variant={t.popular ? "default" : "outline"}
              disabled={loading !== null || isCurrent}
              onClick={() => subscribe(key)}
            >
              {isCurrent
                ? "Your plan"
                : loading === key
                  ? "Redirecting..."
                  : "Subscribe"}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
