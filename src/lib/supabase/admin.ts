// ────────────────────────────────────────────────────────────
// SERVICE-ROLE Supabase client — FULL write access, bypasses RLS.
//
// ⚠️  SERVER-ONLY. Never import this file from a Client Component.
// SUPABASE_SERVICE_ROLE_KEY has no NEXT_PUBLIC_ prefix, so Next never
// inlines it into the client bundle; the runtime guard below is a second
// line of defence in case this module is ever pulled into browser code.
// ────────────────────────────────────────────────────────────

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

if (typeof window !== "undefined") {
  throw new Error(
    "src/lib/supabase/admin.ts was imported in the browser. The service-role key must never reach the client."
  );
}

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// supabase-js builds a realtime client needing a global WebSocket. Node < 22
// (e.g. WSL Node 20) lacks it — supply the `ws` transport. We only use REST,
// so realtime is never opened. Harmless on Node 22+/Vercel. (Mirrors the
// handling in src/lib/supabase.ts.)
function realtimeOpts(): Record<string, unknown> {
  if (typeof (globalThis as { WebSocket?: unknown }).WebSocket !== "undefined") return {};
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ws = require("ws");
    return { realtime: { transport: ws } };
  } catch {
    return {};
  }
}

let _admin: SupabaseClient | null = null;

/** True when the service-role credentials are present. */
export function isAdminConfigured(): boolean {
  return Boolean(URL && SERVICE_ROLE_KEY);
}

/**
 * Service-role client (full write access, bypasses RLS). Returns null when
 * unconfigured so callers can fail with a clear error instead of crashing.
 */
export function supabaseAdmin(): SupabaseClient | null {
  if (!isAdminConfigured()) return null;
  if (!_admin) {
    _admin = createClient(URL!, SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
      ...realtimeOpts(),
    });
  }
  return _admin;
}
