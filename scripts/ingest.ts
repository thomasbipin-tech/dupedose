// ────────────────────────────────────────────────────────────
// Ingestion orchestrator: pull RawProducts from adapters → upsert
// brands/products/offers → run the match engine → upsert dupe_relationships.
//
//   npm run ingest
//
// Add new sources by importing another adapter into ADAPTERS — nothing
// else changes.
// ────────────────────────────────────────────────────────────

import { supabaseAdmin, isSupabaseAdminConfigured } from "../src/lib/supabase";
import { buildAffiliateUrl } from "../src/lib/affiliate";
import { computeMatches, activeEngineVersion } from "../src/lib/match";
import { CuratedAdapter } from "../src/lib/ingest/curated";
import type { RetailerAdapter, RawProduct } from "../src/lib/ingest/adapter";
import type { Product } from "../src/lib/types";
import { RETAILERS } from "../src/lib/data";

const ADAPTERS: RetailerAdapter[] = [
  CuratedAdapter,
  // new RakutenAdapter(), new ImpactAdapter(), new AmazonCreatorsAdapter() …
];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function rawToProduct(r: RawProduct): Product {
  return {
    id: r.externalId,
    brandId: slugify(r.brandName),
    brandName: r.brandName,
    name: r.name,
    category: r.category,
    subcategory: r.subcategory,
    price: r.price,
    image: r.imageUrl,
    rating: r.rating ?? 4.5,
    reviewCount: r.reviewCount ?? 0,
    description: r.description ?? "",
    targetUser: r.targetUser ?? "",
    ingredients: r.ingredients,
    attributes: r.attributes,
    isOriginal: r.isOriginal,
    slug: slugify(`${r.brandName}-${r.name}`),
  };
}

async function main() {
  if (!isSupabaseAdminConfigured()) {
    console.error("✗ Supabase service-role not configured (.env.local). Aborting.");
    process.exit(1);
  }
  const sb = supabaseAdmin()!;

  // 1) Collect raw products + offers from all adapters.
  const productMap = new Map<string, Product>();
  const offers: { product_id: string; retailer_id: string; raw_url: string; affiliate_url: string; price: number | null; source: string }[] = [];

  for (const adapter of ADAPTERS) {
    console.log(`→ adapter: ${adapter.id}`);
    for await (const raw of adapter.fetchProducts()) {
      const product = rawToProduct(raw);
      productMap.set(product.id, product);
      if (raw.productUrl) {
        const retailer = RETAILERS.find((r) => r.id === raw.retailerId) ?? {
          id: raw.retailerId, name: raw.retailerName, homepage: "", network: raw.network,
        };
        offers.push({
          product_id: product.id,
          retailer_id: raw.retailerId,
          raw_url: raw.productUrl,
          affiliate_url: buildAffiliateUrl(raw.productUrl, retailer),
          price: raw.price ?? null,
          source: adapter.id,
        });
      }
    }
  }

  const products = [...productMap.values()];
  console.log(`→ upserting ${products.length} products`);

  // brands (derive from products)
  const brands = new Map<string, { id: string; name: string; category: string }>();
  for (const p of products) brands.set(p.brandId, { id: p.brandId, name: p.brandName, category: p.category });
  await sb.from("brands").upsert([...brands.values()]);

  await sb.from("products").upsert(
    products.map((p) => ({
      id: p.id, brand_id: p.brandId, brand_name: p.brandName, name: p.name,
      category: p.category, subcategory: p.subcategory, price: p.price, image: p.image,
      rating: p.rating, review_count: p.reviewCount, description: p.description,
      target_user: p.targetUser, ingredients: p.ingredients ?? null,
      attributes: p.attributes ?? null, is_original: p.isOriginal ?? false, slug: p.slug,
    }))
  );

  console.log(`→ upserting ${offers.length} offers`);
  await sb.from("product_offers").upsert(offers, { onConflict: "product_id,retailer_id" });

  // 2) Run the match engine for every "original" product against same-category candidates.
  const engineVersion = activeEngineVersion();
  console.log(`→ computing dupe relationships with engine: ${engineVersion}`);
  const originals = products.filter((p) => p.isOriginal);
  let relCount = 0;

  for (const original of originals) {
    const candidates = products.filter((c) => c.category === original.category && c.id !== original.id);
    const matches = await computeMatches(original, candidates);
    if (!matches.length) continue;
    await sb.from("dupe_relationships").upsert(
      matches.map((m) => ({
        original_id: original.id,
        dupe_id: m.productId,
        match_score: m.matchScore,
        dupe_level: m.dupeLevel,
        reason: m.reason,
        engine_version: engineVersion,
      })),
      { onConflict: "original_id,dupe_id" }
    );
    relCount += matches.length;
    console.log(`   ${original.name} → ${matches.length} dupes`);
  }

  console.log(`✓ Ingest complete: ${products.length} products, ${offers.length} offers, ${relCount} relationships (${engineVersion}).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
