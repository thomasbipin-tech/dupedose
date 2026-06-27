// ────────────────────────────────────────────────────────────
// Verify the Supabase connection and report row counts per table.
// Run after seeding to confirm the DB is wired correctly.
//
//   npm run check-db
// ────────────────────────────────────────────────────────────

import { supabaseAnon, supabaseAdmin, isSupabaseConfigured } from "../src/lib/supabase";

// Catalog tables are publicly readable; the log tables are RLS-protected
// (insert-only for anon), so they must be counted with the service-role key.
const PUBLIC_TABLES = [
  "categories",
  "brands",
  "products",
  "retailers",
  "product_offers",
  "dupe_relationships",
];
const LOG_TABLES = ["click_log", "search_log"];
const TABLES = [...PUBLIC_TABLES, ...LOG_TABLES];

async function main() {
  if (!isSupabaseConfigured()) {
    console.error(
      "✗ Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local, then re-run."
    );
    process.exit(1);
  }
  const anon = supabaseAnon()!;
  const admin = supabaseAdmin(); // null if no service-role key
  console.log("→ Connected to Supabase. Row counts:\n");

  let ok = true;
  for (const table of TABLES) {
    // Log tables are RLS-protected (no anon SELECT) — count them with admin.
    const client = LOG_TABLES.includes(table) && admin ? admin : anon;
    const note = LOG_TABLES.includes(table) && !admin ? " (set service-role key to count)" : "";
    const { count, error } = await client.from(table).select("*", { count: "exact", head: true });
    if (error) {
      console.log(`   ✗ ${table.padEnd(20)} ERROR: ${error.message}`);
      ok = false;
    } else {
      console.log(`   ✓ ${table.padEnd(20)} ${count ?? 0}${note}`);
    }
  }

  if (!ok) {
    console.error("\n✗ Some tables errored. Did you run supabase/schema.sql?");
    process.exit(1);
  }
  console.log("\n✓ Database looks healthy.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
