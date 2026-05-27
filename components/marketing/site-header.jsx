import { Wordmark } from "@/components/marketing/wordmark";
import { Nav } from "@/components/marketing/nav";
import { createClient } from "@/lib/supabase/server";

// Server component so the signed-in state is known at first paint (no flicker).
export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-cream/90 backdrop-blur">
      <div className="relative mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
        <Wordmark />
        <Nav user={user ? { email: user.email } : null} />
      </div>
    </header>
  );
}
