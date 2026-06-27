// ────────────────────────────────────────────────────────────
// Build the REAL-DATA catalog: for each intent, search the original + a
// discovery query on SerpApi, let Claude pick & score genuine dupes, then
// upsert real products/offers/bidirectional relationships and re-host images
// to Supabase Storage. Upserts INCREMENTALLY per cluster so progress
// persists (a crash won't wipe the catalog) and the site refills as it runs.
//
//   LIMIT=2 npm run build-catalog        # test on first 2 intents
//   REPLACE=1 npm run build-catalog      # wipe old catalog first, full rebuild
// ────────────────────────────────────────────────────────────

import { createHash } from "crypto";
import { supabaseAdmin, isSupabaseAdminConfigured } from "../src/lib/supabase";
import { INTENTS } from "../src/lib/ingest/intents";
import { searchShopping, mapSource, serpapiConfigured, type ShoppingResult } from "../src/lib/ingest/serpapi";
import { rankDupes, RANK_ENGINE_VERSION } from "../src/lib/ingest/rank";
import type { Category, DupeLevel } from "../src/lib/types";

const BUCKET = "product-images";
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);
const stableUuid = (seed: string) => {
  const h = createHash("sha1").update(seed).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
};
const invertLevel: Record<DupeLevel, DupeLevel> = { budget: "premium", premium: "budget", similar: "similar" };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function rehostImage(sb: any, productId: string, url?: string): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "image/jpeg";
    const ext = ct.includes("png") ? "png" : ct.includes("webp") ? "webp" : "jpg";
    const buf = Buffer.from(await res.arrayBuffer());
    const path = `${productId}.${ext}`;
    const up = await sb.storage.from(BUCKET).upload(path, buf, { contentType: ct, upsert: true });
    if (up.error) return null;
    return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl as string;
  } catch {
    return null;
  }
}

async function main() {
  if (!isSupabaseAdminConfigured()) { console.error("✗ Supabase service-role not configured."); process.exit(1); }
  if (!serpapiConfigured()) { console.error("✗ SERPAPI_KEY not set."); process.exit(1); }
  if (!process.env.ANTHROPIC_API_KEY) { console.error("✗ ANTHROPIC_API_KEY not set."); process.exit(1); }
  const sb = supabaseAdmin()!;

  const limit = process.env.LIMIT ? parseInt(process.env.LIMIT, 10) : INTENTS.length;
  const replace = process.env.REPLACE === "1";
  const intents = INTENTS.slice(0, limit);
  console.log(`→ Building ${intents.length} intent(s)${replace ? " (REPLACE mode)" : ""}`);

  await sb.storage.createBucket(BUCKET, { public: true }).catch(() => {});

  if (replace) {
    console.log("→ Clearing existing catalog…");
    await sb.from("dupe_relationships").delete().not("id", "is", null);
    await sb.from("product_offers").delete().not("id", "is", null);
    await sb.from("products").delete().not("id", "is", null);
  }

  const seenProducts = new Set<string>();
  let searches = 0, totalProducts = 0, totalRels = 0;

  for (const intent of intents) {
    console.log(`\n→ ${intent.originalQuery}`);
    let originalRes: ShoppingResult[] = [], dupeRes: ShoppingResult[] = [];
    try {
      originalRes = await searchShopping(intent.originalQuery); searches++;
      dupeRes = await searchShopping(intent.discoveryQuery); searches++;
    } catch (e) { console.error("  search error:", (e as Error).message); continue; }
    if (!originalRes.length) { console.log("  no results, skip"); continue; }

    const original = originalRes[0];
    const ranked = await rankDupes(intent, original, dupeRes);
    if (!ranked) { console.log("  ranking failed, skip"); continue; }

    // Build this cluster's rows.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prodRows: any[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const offerRows: any[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const brandRows = new Map<string, any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const retailerRows = new Map<string, any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const relRows: any[] = [];
    const offerKeys = new Set<string>();

    const addProduct = async (brand: string, name: string, cand: ShoppingResult, isOriginal: boolean, desc: string, target: string) => {
      const id = slugify(`${brand} ${name}`);
      if (!id) return null;
      if (!seenProducts.has(id)) {
        const image = await rehostImage(sb, id, cand.thumbnail);
        prodRows.push({
          id, brand_id: slugify(brand), brand_name: brand, name, category: intent.category, subcategory: intent.subcategory,
          price: cand.price ?? null, image, rating: cand.rating ?? (isOriginal ? 4.6 : 4.4), review_count: cand.reviews ?? 0,
          description: desc, target_user: target, is_original: isOriginal, slug: id,
        });
        brandRows.set(slugify(brand), { id: slugify(brand), name: brand, category: intent.category });
        const r = mapSource(cand.source);
        retailerRows.set(r.retailerId, { id: r.retailerId, name: r.retailerName, homepage: "", network: r.network });
        const okey = `${id}|${r.retailerId}`;
        if (!offerKeys.has(okey)) {
          offerKeys.add(okey);
          offerRows.push({ id: stableUuid(okey), product_id: id, retailer_id: r.retailerId, raw_url: r.searchUrl(`${brand} ${name}`), price: cand.price ?? null, currency: "USD", in_stock: true, source: "serpapi" });
        }
        seenProducts.add(id);
      }
      return id;
    };

    const oBrand = ranked.originalBrand || original.source;
    const oId = await addProduct(oBrand, ranked.originalName, original, true,
      `${oBrand} ${ranked.originalName} — the ${intent.tags?.includes("luxury") ? "luxury" : "sought-after"} ${intent.subcategory.toLowerCase()} shoppers search dupes for.`,
      `Fans of ${intent.subcategory.toLowerCase()} who want this exact result`);
    if (!oId) { console.log("  bad original, skip"); continue; }

    for (const d of ranked.dupes) {
      const cand = dupeRes[d.index];
      if (!cand) continue;
      const dId = await addProduct(d.brand, d.name, cand, false, `${d.brand} ${d.name} — ${d.reason}`, `A ${d.dupeLevel} alternative to ${oBrand} ${ranked.originalName}`);
      if (!dId || dId === oId) continue;
      relRows.push({ original_id: oId, dupe_id: dId, match_score: d.matchScore, dupe_level: d.dupeLevel, reason: d.reason, engine_version: RANK_ENGINE_VERSION });
      relRows.push({ original_id: dId, dupe_id: oId, match_score: d.matchScore, dupe_level: invertLevel[d.dupeLevel], reason: `Higher-end pick that ${d.brand} ${d.name} is a dupe of`, engine_version: RANK_ENGINE_VERSION });
    }

    // Incremental upsert for this cluster (progress persists).
    if (brandRows.size) { const e = await sb.from("brands").upsert([...brandRows.values()]); if (e.error) { console.error("  brands:", e.error.message); continue; } }
    if (retailerRows.size) { const e = await sb.from("retailers").upsert([...retailerRows.values()]); if (e.error) console.error("  retailers:", e.error.message); }
    if (prodRows.length) { const e = await sb.from("products").upsert(prodRows); if (e.error) { console.error("  products:", e.error.message); continue; } }
    if (offerRows.length) { const e = await sb.from("product_offers").upsert(offerRows, { onConflict: "product_id,retailer_id" }); if (e.error) console.error("  offers:", e.error.message); }
    if (relRows.length) {
      // dedupe rel rows by (original,dupe)
      const seen = new Set<string>();
      const dedup = relRows.filter((r) => { const k = `${r.original_id}|${r.dupe_id}`; if (seen.has(k)) return false; seen.add(k); return true; });
      const e = await sb.from("dupe_relationships").upsert(dedup, { onConflict: "original_id,dupe_id" }); if (e.error) console.error("  rels:", e.error.message);
      totalRels += dedup.length;
    }
    totalProducts += prodRows.length;
    console.log(`  ✓ +${prodRows.length} products, +${relRows.length} rels (running: ${totalProducts} products)`);
    await sleep(300);
  }

  console.log(`\n✓ Build complete. SerpApi searches used: ${searches}. New products this run: ${totalProducts}, relationships: ${totalRels}.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
