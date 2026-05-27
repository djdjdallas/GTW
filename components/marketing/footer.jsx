import Link from "next/link";
import { Wordmark } from "@/components/marketing/wordmark";

export function Footer() {
  return (
    <footer className="border-t border-border bg-cream">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <Wordmark />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Pressed daily. Yours daily. A refined daily ritual from the Green The
            World family.
          </p>
        </div>

        <div>
          <p className="eyebrow mb-4">Explore</p>
          <ul className="flex flex-col gap-3 text-sm">
            <li><Link href="/menu" className="hover:text-primary">Menu</Link></li>
            <li><Link href="/pricing" className="hover:text-primary">Pricing</Link></li>
            <li><Link href="/about" className="hover:text-primary">About</Link></li>
            <li><Link href="/faq" className="hover:text-primary">FAQ</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-4">Connect</p>
          <ul className="flex flex-col gap-3 text-sm">
            <li>
              <a
                href="https://instagram.com/greentheworldlv"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary"
              >
                Instagram @greentheworldlv
              </a>
            </li>
            <li>
              <a href="mailto:hello@greentheworld.juice" className="hover:text-primary">
                hello@greentheworld.juice
              </a>
            </li>
            <li><Link href="/login" className="hover:text-primary">Member login</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-6 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>From the Green The World family.</p>
          <p>(c) {new Date().getFullYear()} Green The World Juice. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
