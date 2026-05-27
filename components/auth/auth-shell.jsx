import Link from "next/link";
import { Wordmark } from "@/components/marketing/wordmark";

// Minimal centered shell for the login and signup screens. No full nav so the
// focus stays on the form, per the brand's no-clutter rule.
export function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
          <Wordmark />
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
            Back to site
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <h1 className="font-display text-4xl">{title}</h1>
          {subtitle ? <p className="mt-2 text-muted-foreground">{subtitle}</p> : null}
          <div className="mt-8">{children}</div>
          {footer ? <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div> : null}
        </div>
      </main>
    </div>
  );
}
