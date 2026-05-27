import Link from "next/link";
import { SiteHeader } from "@/components/marketing/site-header";
import { Footer } from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About",
  description: "The story behind Green The World Juice, a refined daily ritual from Las Vegas.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="mx-auto max-w-[800px] px-6 py-16 md:py-24">
        <p className="eyebrow mb-4">Our story</p>
        <h1 className="font-display text-5xl md:text-6xl">
          A daily ritual, <span className="italic text-primary">made simple.</span>
        </h1>

        <div className="mt-10 space-y-6 text-lg leading-relaxed text-charcoal">
          <p>
            Green The World Juice started with a simple idea: the healthiest
            habit should also be the easiest one. So we built a membership, not a
            checkout line. Pressed at five, picked up by nine, repeat.
          </p>
          <p>
            Every juice is cold pressed in small batches the morning you drink it.
            No concentrate, no shortcuts, no shelf life measured in weeks. Eight
            recipes, each balanced to taste like something you actually crave, not
            something you tolerate.
          </p>
          <p>
            The membership is the point. Instead of paying full price for a treat
            you buy once in a while, you pay a flat monthly rate and the juice
            becomes part of your day. The more you show up, the more it pays you
            back.
          </p>
          <p>
            We are a sub brand of the wider Green The World family, with our own
            identity but the same mission: small daily choices, better world.
          </p>
        </div>

        <div className="mt-10">
          <Button asChild size="lg">
            <Link href="/pricing">See the plans</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
