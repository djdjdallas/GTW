import Link from "next/link";
import { Check } from "lucide-react";
import { Wordmark } from "@/components/marketing/wordmark";
import { Button } from "@/components/ui/button";

export const metadata = { title: "You are in" };

export default function CheckoutSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-[1200px] px-6 py-4">
          <Wordmark />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <Check className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="mt-6 font-display text-4xl">Welcome to the ritual.</h1>
          <p className="mt-4 text-muted-foreground">
            Your subscription is active and your credits are on the way. It can
            take a few seconds for everything to sync.
          </p>
          <p className="mt-4 text-muted-foreground">
            Download the Green The World app and log in with the same email to
            start ordering, or place your first order right here on the web.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Button asChild size="lg">
              <Link href="/dashboard">Go to my dashboard</Link>
            </Button>
            <Button asChild variant="link">
              <Link href="/order">Place an order now</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
