// ────────────────────────────────────────────────────────────
// Seed the Supabase database from the in-code fixtures (src/lib/data.ts).
// Idempotent: re-running upserts. Proves the DB-backed site renders
// identically to the seed-fallback site.
//
//   node --env-file=.env.local node_modules/.bin/tsx scripts/seed.ts
//   (or: npm run seed)
// ────────────────────────────────────────────────────────────

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

  console.log("→ product_offers");
  await sb.from("product_offers").upsert(
    OFFERS.map((o) => {
      const retailer = RETAILERS.find((r) => r.id === o.retailerId)!;
      return {
        id: undefined, // let DB assign uuid; unique(product_id,retailer_id) dedupes
        product_id: o.productId,
        retailer_id: o.retailerId,
        raw_url: o.rawUrl,
        affiliate_url: buildAffiliateUrl(o.rawUrl, retailer),
        price: o.price ?? null,
        currency: o.currency ?? "USD",
        in_stock: o.inStock ?? true,
        source: "curated",
      };
    }),
    { onConflict: "product_id,retailer_id" }
  );

  console.log("→ dupe_relationships (seed-manual)");
  const rels = Object.entries(ALTERNATIVES).flatMap(([originalId, alts]) =>
    alts.map((a) => ({
      original_id: originalId,
      dupe_id: a.productId,
      match_score: a.matchScore,
      dupe_level: a.dupeLevel,
      reason: a.reason,
      engine_version: "seed-manual",
    }))
  );
  await sb.from("dupe_relationships").upsert(rels, { onConflict: "original_id,dupe_id" });

  console.log(`✓ Seed complete: ${PRODUCTS.length} products, ${OFFERS.length} offers, ${rels.length} relationships.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
