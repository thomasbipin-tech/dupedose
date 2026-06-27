// ────────────────────────────────────────────────────────────
// Scheduled price/availability refresh. Iterates adapters that implement
// fetchPriceUpdates() and updates product_offers. Wire to Vercel Cron via
// /api/cron/refresh, or run on a GitHub Action schedule.
//
//   npm run refresh-prices
// ────────────────────────────────────────────────────────────

import { supabaseAdmin, isSupabaseAdminConfigured } from "../src/lib/supabase";
import { CuratedAdapter } from "../src/lib/ingest/curated";
import type { RetailerAdapter } from "../src/lib/ingest/adapter";

const ADAPTERS: RetailerAdapter[] = [CuratedAdapter];

async function main() {
  if (!isSupabaseAdminConfigured()) {
    console.error("✗ Supabase service-role not configured (.env.local). Aborting.");
    process.exit(1);
  }
  const sb = supabaseAdmin()!;

  const { data: existing } = await sb.from("product_offers").select("product_id, retailer_id");
  const keys = (existing ?? []).map((r) => ({ productId: r.product_id, retailerId: r.retailer_id }));

  let updated = 0;
  for (const adapter of ADAPTERS) {
    if (!adapter.fetchPriceUpdates) {
      console.log(`→ ${adapter.id}: no price feed (skipping)`);
      continue;
    }
    const updates = await adapter.fetchPriceUpdates(keys.filter((k) => k.retailerId === adapter.id));
    for (const u of updates) {
      await sb
        .from("product_offers")
        .update({ price: u.price, in_stock: u.inStock, last_checked_at: new Date().toISOString() })
        .eq("product_id", u.productId)
        .eq("retailer_id", u.retailerId);
      updated++;
    }
  }

  console.log(`✓ Refreshed ${updated} offers.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
