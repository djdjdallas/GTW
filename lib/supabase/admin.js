import { createClient } from "@supabase/supabase-js";

/*
  Service role client. Bypasses RLS, so it MUST only ever be imported into server
  side route handlers (checkout, billing portal, Stripe webhook). Never import it
  into a client component or any code that ships to the browser. Auth persistence
  is disabled because there is no user session in these server only contexts.
*/
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
