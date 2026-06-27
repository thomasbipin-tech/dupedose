import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ────────────────────────────────────────────────────────────
// Supabase client factories with graceful no-credential handling.
//
// Until a Supabase project is connected (env vars set), these return
// null and the data layer (src/lib/db.ts) falls back to the in-memory
// seed fixtures — so the site works with ZERO external setup, and
// flips to Postgres the moment credentials land.
// ────────────────────────────────────────────────────────────

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** True when read credentials are present. */
export function isSupabaseConfigured() {
  return Boolean(URL && ANON_KEY);
}

/** True when write/service credentials are present (scripts, API routes). */
export function isSupabaseAdminConfigured() {
  return Boolean(URL && SERVICE_ROLE_KEY);
}

// supabase-js v2 constructs a realtime client that needs a global WebSocket.
// Node < 22 (e.g. WSL Node 20) lacks it — supply the `ws` transport. We only
// use REST, so realtime is never actually opened. Harmless on Node 22+/Vercel.
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

let _anon: SupabaseClient | null = null;
let _admin: SupabaseClient | null = null;

/** Read-only client (anon key). Safe for server components. Null if unconfigured. */
export function supabaseAnon(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!_anon) _anon = createClient(URL!, ANON_KEY!, { auth: { persistSession: false }, ...realtimeOpts() });
  return _anon;
}

/**
 * Service-role client (full write access). SERVER / SCRIPTS ONLY —
 * never import this from a client component. Null if unconfigured.
 */
export function supabaseAdmin(): SupabaseClient | null {
  if (!isSupabaseAdminConfigured()) return null;
  if (!_admin) _admin = createClient(URL!, SERVICE_ROLE_KEY!, { auth: { persistSession: false }, ...realtimeOpts() });
  return _admin;
}
