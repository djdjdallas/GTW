import Link from "next/link";
import { Wordmark } from "@/components/marketing/wordmark";
import { SignOutButton } from "@/components/dashboard/sign-out-button";

const NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/order", label: "Order now" },
  { href: "/menu", label: "Menu" },
];

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-border bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-4">
          <Wordmark />
          <nav className="hidden items-center gap-6 md:flex">
            {NAV.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm text-foreground/80 hover:text-primary">
                {l.label}
              </Link>
            ))}
          </nav>
          <SignOutButton />
        </div>
        <nav className="flex items-center gap-5 overflow-x-auto border-t border-border px-6 py-3 md:hidden">
          {NAV.map((l) => (
            <Link key={l.href} href={l.href} className="whitespace-nowrap text-sm text-foreground/80">
              {l.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-[1100px] px-6 py-10">{children}</main>
    </div>
  );
}
