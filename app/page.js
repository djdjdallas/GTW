import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { Footer } from "@/components/marketing/footer";
import { DrinkCard } from "@/components/marketing/drink-card";
import { HomeSpinWheel } from "@/components/marketing/home-spin-wheel";
import { HomeSpinWheelEditorial } from "@/components/marketing/home-spin-wheel-editorial";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDrinks } from "@/lib/menu";
import { FAQS } from "@/lib/faqs";
import { TIER_ORDER, TIERS } from "@/lib/tiers";

const STEPS = [
  { n: "01", title: "Subscribe", body: "Pick a tier in under a minute. Your credits land instantly." },
  { n: "02", title: "Spin to browse", body: "Flick through eight cold pressed juices on the wheel and build your order." },
  { n: "03", title: "Pick up daily", body: "Show your code at the counter. Pressed at five, picked up by nine." },
];

export default async function HomePage({ searchParams }) {
  const drinks = await getDrinks();

  // The editorial slideshow is the default homepage wheel. The original 3D GSAP
  // carousel is kept reachable at ?wheel=carousel for comparison.
  const { wheel } = (await searchParams) ?? {};
  const SpinWheelVariant =
    wheel === "carousel" ? HomeSpinWheel : HomeSpinWheelEditorial;

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto max-w-[1200px] px-6 py-20 md:py-28">
        <div className="max-w-3xl">
          <p className="eyebrow mb-5">Cold pressed daily . Las Vegas</p>
          <h1 className="font-display text-5xl text-foreground sm:text-6xl md:text-7xl">
            Green the world,
            <br />
            <span className="italic text-primary">one juice at a time.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            A juice subscription that pays you back daily. Eight cold pressed
            juices. Five tiers. One ritual.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Button asChild size="lg">
              <Link href="/pricing">See plans</Link>
            </Button>
            <Button asChild variant="link" size="lg">
              <Link href="/menu">Browse the menu</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-ivory">
        <div className="mx-auto max-w-[1200px] px-6 py-20 md:py-24">
          <p className="eyebrow mb-3">How it works</p>
          <h2 className="font-display text-4xl md:text-5xl">
            Three steps to a daily habit
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n}>
                <span className="font-display text-3xl italic text-primary/40">{s.n}</span>
                <h3 className="mt-2 text-2xl font-medium">{s.title}</h3>
                <p className="mt-2 text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Spin wheel preview (A/B variant selected above) */}
      <SpinWheelVariant />

      {/* Featured drinks */}
      <section className="mx-auto max-w-[1200px] px-6 py-20 md:py-24">
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow mb-3">The menu</p>
            <h2 className="font-display text-4xl md:text-5xl">Eight to choose from</h2>
          </div>
          <Link href="/menu" className="hidden items-center gap-1 text-sm text-primary hover:underline sm:flex">
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-4">
          {drinks.map((d) => (
            <DrinkCard key={d.id} drink={d} />
          ))}
        </div>
      </section>

      {/* Tier teaser */}
      <section className="bg-ivory">
        <div className="mx-auto max-w-[1200px] px-6 py-20 md:py-24">
          <p className="eyebrow mb-3">Membership</p>
          <h2 className="font-display text-4xl md:text-5xl">
            Five tiers. Pick your pace.
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {TIER_ORDER.map((key) => {
              const t = TIERS[key];
              return (
                <div
                  key={key}
                  className="relative rounded-xl border border-border bg-card p-5"
                >
                  {t.popular && (
                    <Badge className="absolute -top-3 left-5">Most popular</Badge>
                  )}
                  <h3 className="font-display text-2xl">{t.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t.tagline}</p>
                  <p className="mt-4 text-2xl font-medium">
                    ${t.price}
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </p>
                  <p className="mt-2 text-sm text-primary">
                    {t.unlimited ? "Unlimited" : `${t.credits} credits`}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mt-10">
            <Button asChild size="lg">
              <Link href="/pricing">Compare all plans</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-[800px] px-6 py-20 md:py-24">
        <p className="eyebrow mb-3">Questions</p>
        <h2 className="font-display text-4xl md:text-5xl">Good to know</h2>
        <div className="mt-10">
          <FaqAccordion items={FAQS} />
        </div>
      </section>

      <Footer />
    </div>
  );
}
