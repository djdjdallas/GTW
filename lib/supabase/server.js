import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/*
  Server client for server components, route handlers, and server actions.
  In Next 15 cookies() is async, so this helper is async too. We wrap the
  cookie setters in try/catch because Server Components are not allowed to
  mutate cookies. When that throws, middleware is responsible for refreshing
  the session instead, so swallowing the error here is safe.
*/
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component. Safe to ignore: middleware refreshes.
          }
        },
      },
    }
  );
}
