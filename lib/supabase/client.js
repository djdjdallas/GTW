import { createBrowserClient } from "@supabase/ssr";

// Browser client for use inside client components only. Uses the public anon key,
// so all access is constrained by Row Level Security.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
