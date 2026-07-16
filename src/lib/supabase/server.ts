// ────────────────────────────────────────────────────────────
// Cookie-bound Supabase client for Server Components, Route Handlers,
// and middleware helpers. Uses the ANON key + the request's auth
// cookies, so `auth.getUser()` returns the signed-in user (or null).
//
// Reads only — all privileged writes go through ./admin (service role).
// ────────────────────────────────────────────────────────────

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";
import { isAdminEmail } from "@/lib/auth/isAdmin";

/**
 * Build a request-scoped Supabase client bound to the caller's cookies.
 * Safe in Server Components (cookie writes are swallowed — middleware
 * refreshes the session there) and in Route Handlers (writes stick).
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component where cookies are read-only.
            // The middleware refreshes the session cookie on every request,
            // so this is safe to ignore.
          }
        },
      },
    }
  );
}

/**
 * The authenticated user for this request, verified against the Supabase
 * auth server (not just decoded from the cookie). Returns null if signed out.
 */
export async function getServerUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Guard for admin-only server code. Returns the user when they are both
 * authenticated AND on the ADMIN_EMAILS allow-list; otherwise null.
 */
export async function getAdminUser(): Promise<User | null> {
  const user = await getServerUser();
  if (user && isAdminEmail(user.email)) return user;
  return null;
}
