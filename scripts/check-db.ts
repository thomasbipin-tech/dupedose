// ────────────────────────────────────────────────────────────
// Verify the Supabase connection and report row counts per table.
// Run after seeding to confirm the DB is wired correctly.
//
//   npm run check-db
// ────────────────────────────────────────────────────────────

import { supabaseAnon, isSupabaseConfigured } from "../src/lib/supabase";

const TABLES = [
  "categories",
  "brands",
  "products",
  "retailers",
  "product_offers",
  "dupe_relationships",
  "click_log",
  "search_log",
];

async function main() {
  if (!isSupabaseConfigured()) {
    console.error(
      "✗ Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local, then re-run."
    );
    process.exit(1);
  }
  const sb = supabaseAnon()!;
  console.log("→ Connected to Supabase. Row counts:\n");

  let ok = true;
  for (const table of TABLES) {
    const { count, error } = await sb.from(table).select("*", { count: "exact", head: true });
    if (error) {
      console.log(`   ✗ ${table.padEnd(20)} ERROR: ${error.message}`);
      ok = false;
    } else {
      console.log(`   ✓ ${table.padEnd(20)} ${count ?? 0}`);
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
