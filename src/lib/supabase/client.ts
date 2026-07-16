"use client";
// ────────────────────────────────────────────────────────────
// Browser Supabase client (ANON key only). Used by the login page to
// send magic links and by any future client-side auth UI. Persists the
// session in cookies via @supabase/ssr so the server sees the same user.
// ────────────────────────────────────────────────────────────

import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
