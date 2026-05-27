import { SiteHeader } from "@/components/marketing/site-header";
import { Footer } from "@/components/marketing/footer";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { FAQS } from "@/lib/faqs";

export const metadata = {
  title: "FAQ",
  description: "Answers about the Green The World Juice membership, credits, and pickup.",
};

export default function FaqPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="mx-auto max-w-[800px] px-6 py-16 md:py-24">
        <p className="eyebrow mb-4">Questions</p>
        <h1 className="font-display text-5xl md:text-6xl">Everything to know.</h1>
        <div className="mt-12">
          <FaqAccordion items={FAQS} />
        </div>
      </section>

      <Footer />
    </div>
  );
}
