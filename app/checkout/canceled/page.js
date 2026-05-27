import Link from "next/link";
import { Wordmark } from "@/components/marketing/wordmark";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Checkout canceled" };

export default function CheckoutCanceledPage() {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-[1200px] px-6 py-4">
          <Wordmark />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md text-center">
          <h1 className="font-display text-4xl">No worries.</h1>
          <p className="mt-4 text-muted-foreground">
            Your checkout was canceled and you have not been charged. The plans
            are right where you left them whenever you are ready.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Button asChild size="lg">
              <Link href="/pricing">Back to plans</Link>
            </Button>
            <Button asChild variant="link">
              <Link href="/">Return home</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
