import { SiteHeader } from "@/components/marketing/site-header";
import { Footer } from "@/components/marketing/footer";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { createClient } from "@/lib/supabase/server";
import { FAQS } from "@/lib/faqs";

export const metadata = {
  title: "Pricing",
  description: "Five tiers of cold pressed juice membership, from $10 to $75 a month.",
};

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let currentTier = null;
  if (user) {
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("tier, status")
      .eq("user_id", user.id)
      .maybeSingle();
    if (sub && (sub.status === "active" || sub.status === "trialing")) {
      currentTier = sub.tier;
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="mx-auto max-w-[1200px] px-6 py-16 md:py-20">
        <div className="max-w-2xl">
          <p className="eyebrow mb-4">Membership</p>
          <h1 className="font-display text-5xl md:text-6xl">
            Membership that pays you back in juice.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Every tier gives you credits redeemable for cold pressed juice at the
            shop. Cancel or change anytime from your dashboard.
          </p>
        </div>

        <div className="mt-12">
          <PricingCards isAuthed={!!user} currentTier={currentTier} />
        </div>
      </section>

      <section className="mx-auto max-w-[800px] px-6 pb-24">
        <h2 className="font-display text-3xl md:text-4xl">Questions</h2>
        <div className="mt-8">
          <FaqAccordion items={FAQS} />
        </div>
      </section>

      <Footer />
    </div>
  );
}
