// ────────────────────────────────────────────────────────────
// Seed the Supabase database from the in-code fixtures (src/lib/data.ts).
// Idempotent: re-running upserts. Proves the DB-backed site renders
// identically to the seed-fallback site.
//
//   node --env-file=.env.local node_modules/.bin/tsx scripts/seed.ts
//   (or: npm run seed)
// ────────────────────────────────────────────────────────────

import { createHash } from "crypto";
import { supabaseAdmin, isSupabaseAdminConfigured } from "../src/lib/supabase";
import {
  BRANDS,
  PRODUCTS,
  RETAILERS,
  OFFERS,
  ALTERNATIVES,
  CATEGORIES,
} from "../src/lib/data";
import { buildAffiliateUrl } from "../src/lib/affiliate";

// Deterministic UUID from a seed string, so offer IDs are STABLE across
// reseeds — prerendered /api/go/<id> links keep working after a refresh.
function stableUuid(seed: string): string {
  const h = createHash("sha1").update(seed).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}

async function main() {
  if (!isSupabaseAdminConfigured()) {
    console.error(
      "✗ Supabase service-role not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "SUPABASE_SERVICE_ROLE_KEY in .env.local, then re-run."
    );
    process.exit(1);
  }
  const sb = supabaseAdmin()!;

  console.log("→ categories");
  await sb.from("categories").upsert(
    CATEGORIES.map((c, i) => ({
      slug: c.slug,
      label: c.label,
      icon: c.icon,
      description: c.description,
      color: c.color,
      bg_color: c.bgColor,
      subcategories: c.subcategories,
      sort_order: i,
    }))
  );

  console.log("→ brands");
  await sb.from("brands").upsert(
    BRANDS.map((b) => ({
      id: b.id,
      name: b.name,
      category: b.category,
      luxury_level: b.luxuryLevel,
      country: b.country,
      price_range: b.priceRange,
      logo: b.logo,
    }))
  );

  console.log("→ products");
  await sb.from("products").upsert(
    PRODUCTS.map((p) => ({
      id: p.id,
      brand_id: p.brandId,
      brand_name: p.brandName,
      name: p.name,
      category: p.category,
      subcategory: p.subcategory,
      price: p.price,
      image: p.image,
      rating: p.rating,
      review_count: p.reviewCount,
      description: p.description,
      target_user: p.targetUser,
      ingredients: p.ingredients ?? null,
      attributes: p.attributes ?? null,
      is_original: p.isOriginal ?? false,
      slug: p.slug,
    }))
  );

  console.log("→ retailers");
  await sb.from("retailers").upsert(
    RETAILERS.map((r) => ({
      id: r.id,
      name: r.name,
      homepage: r.homepage,
      network: r.network,
      logo: r.logo,
    }))
  );

  // Full refresh of offers so stale/old retailer rows (e.g. removed brand-direct
  // URLs) don't linger alongside the new ones. Seed data is the source of truth.
  console.log("→ product_offers (full refresh)");
  await sb.from("product_offers").delete().not("id", "is", null);
  const { error: offersErr } = await sb.from("product_offers").insert(
    OFFERS.map((o) => {
      const retailer = RETAILERS.find((r) => r.id === o.retailerId)!;
      return {
        id: stableUuid(`${o.productId}|${o.retailerId}`),
        product_id: o.productId,
        retailer_id: o.retailerId,
        raw_url: o.rawUrl,
        affiliate_url: buildAffiliateUrl(o.rawUrl, retailer),
        price: o.price ?? null,
        currency: o.currency ?? "USD",
        in_stock: o.inStock ?? true,
        source: "curated",
      };
    })
  );
  if (offersErr) throw new Error(`product_offers insert failed: ${offersErr.message}`);

  // Dupe relationships — BIDIRECTIONAL so a dupe's page links back to the original.
  console.log("→ dupe_relationships (bidirectional, full refresh)");
  const invertLevel: Record<string, "premium" | "similar" | "budget"> = {
    budget: "premium",
    premium: "budget",
    similar: "similar",
  };
  const reverseReason: Record<string, string> = {
    budget: "Higher-end original with a comparable profile",
    premium: "More affordable alternative with a comparable profile",
    similar: "Comparable alternative",
  };
  const relMap = new Map<string, { original_id: string; dupe_id: string; match_score: number; dupe_level: string; reason: string; engine_version: string }>();
  for (const [originalId, alts] of Object.entries(ALTERNATIVES)) {
    for (const a of alts) {
      // forward: original → dupe
      relMap.set(`${originalId}|${a.productId}`, {
        original_id: originalId, dupe_id: a.productId,
        match_score: a.matchScore, dupe_level: a.dupeLevel, reason: a.reason,
        engine_version: "seed-manual",
      });
      // reverse: dupe → original (only if not already a curated forward pair)
      const revKey = `${a.productId}|${originalId}`;
      if (!relMap.has(revKey)) {
        relMap.set(revKey, {
          original_id: a.productId, dupe_id: originalId,
          match_score: a.matchScore, dupe_level: invertLevel[a.dupeLevel], reason: reverseReason[a.dupeLevel],
          engine_version: "seed-manual-reverse",
        });
      }
    }
  }
  const rels = [...relMap.values()];
  await sb.from("dupe_relationships").delete().not("id", "is", null);
  const { error: relErr } = await sb.from("dupe_relationships").insert(rels);
  if (relErr) throw new Error(`dupe_relationships insert failed: ${relErr.message}`);

  console.log(`✓ Seed complete: ${PRODUCTS.length} products, ${OFFERS.length} offers, ${rels.length} relationships (bidirectional).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
