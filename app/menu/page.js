import { SiteHeader } from "@/components/marketing/site-header";
import { Footer } from "@/components/marketing/footer";
import { DrinkCard } from "@/components/marketing/drink-card";
import { getDrinks } from "@/lib/menu";

export const metadata = {
  title: "Menu",
  description: "Eight cold pressed juices, pressed fresh daily in Las Vegas.",
};

export default async function MenuPage() {
  const drinks = await getDrinks();

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="mx-auto max-w-[1200px] px-6 py-16 md:py-20">
        <p className="eyebrow mb-4">The menu</p>
        <h1 className="font-display text-5xl md:text-6xl">
          Eight cold pressed juices.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted-foreground">
          Pressed daily, never from concentrate. Greens forward, never grassy.
          Every juice is redeemable with your membership credits.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {drinks.map((d) => (
            <DrinkCard key={d.id} drink={d} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
