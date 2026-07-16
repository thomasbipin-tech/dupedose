// ────────────────────────────────────────────────────────────
// Phase 2 of the session-ranked pipeline: read clusters whose RankResult was
// authored by Claude in-session (no API), and upsert products / offers /
// bidirectional relationships exactly like build-catalog.ts does.
//
//   FILE=.ingest-batches/ranked-47-12.json npm run ingest-ranked
//
// File shape: Array<{ intent, original, candidates, ranked: RankResult }>
// ────────────────────────────────────────────────────────────

import { createHash } from "crypto";
import { readFileSync } from "fs";
import { supabaseAdmin, isSupabaseAdminConfigured } from "../src/lib/supabase";
import { mapSource, type ShoppingResult } from "../src/lib/ingest/serpapi";
import type { RankResult } from "../src/lib/ingest/rank";
import type { DupeIntent } from "../src/lib/ingest/intents";
import type { DupeLevel } from "../src/lib/types";

const RANK_ENGINE_VERSION = "claude-opus-4-8-session-rank-v2";
const BUCKET = "product-images";
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);
const stableUuid = (seed: string) => {
  const h = createHash("sha1").update(seed).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
};
const invertLevel: Record<DupeLevel, DupeLevel> = { budget: "premium", premium: "budget", similar: "similar" };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface RankedCluster {
  intent: DupeIntent;
  original: ShoppingResult;
  candidates: ShoppingResult[];
  ranked: RankResult;
}

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
  const file = process.env.FILE;
  if (!file) { console.error("✗ FILE env var required (path to ranked-*.json)."); process.exit(1); }
  const sb = supabaseAdmin()!;
  const clusters: RankedCluster[] = JSON.parse(readFileSync(file, "utf8"));
  console.log(`→ Ingesting ${clusters.length} ranked cluster(s) from ${file}`);

  await sb.storage.createBucket(BUCKET, { public: true }).catch(() => {});

  const seenProducts = new Set<string>();
  let totalProducts = 0, totalRels = 0;

  for (const { intent, original, candidates, ranked } of clusters) {
    console.log(`\n→ ${intent.originalQuery}`);
    // Same validation build-catalog applies to the model output.
    ranked.dupes = (ranked.dupes ?? [])
      .filter((d) => d.index >= 0 && d.index < candidates.length)
      .map((d) => ({
        ...d,
        matchScore: Math.max(0, Math.min(100, Math.round(d.matchScore))),
        dupeLevel: (["premium", "similar", "budget"].includes(d.dupeLevel) ? d.dupeLevel : "similar") as DupeLevel,
      }))
      .slice(0, 6);
    ranked.catalog = (ranked.catalog ?? []).filter((c) => c.index >= 0 && c.index < candidates.length);

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

    const addProduct = async (brand: string, name: string, cand: ShoppingResult, isOriginal: boolean, desc: string, target: string, rehost = true) => {
      const id = slugify(`${brand} ${name}`);
      if (!id) return null;
      if (!seenProducts.has(id)) {
        const image = rehost ? (await rehostImage(sb, id, cand.thumbnail)) ?? cand.thumbnail ?? null : (cand.thumbnail ?? null);
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
      const cand = candidates[d.index];
      if (!cand) continue;
      const dId = await addProduct(d.brand, d.name, cand, false, `${d.brand} ${d.name} — ${d.reason}`, `A ${d.dupeLevel} alternative to ${oBrand} ${ranked.originalName}`);
      if (!dId || dId === oId) continue;
      relRows.push({ original_id: oId, dupe_id: dId, match_score: d.matchScore, dupe_level: d.dupeLevel, reason: d.reason, engine_version: RANK_ENGINE_VERSION });
      relRows.push({ original_id: dId, dupe_id: oId, match_score: d.matchScore, dupe_level: invertLevel[d.dupeLevel], reason: `Higher-end pick that ${d.brand} ${d.name} is a dupe of`, engine_version: RANK_ENGINE_VERSION });
    }

    for (const cItem of ranked.catalog ?? []) {
      const cand = candidates[cItem.index];
      if (!cand || cand.price == null || !cand.thumbnail) continue;
      await addProduct(cItem.brand, cItem.name, cand, false, `${cItem.brand} ${cItem.name} — a ${intent.subcategory.toLowerCase()} alternative.`, `${intent.subcategory} shoppers`, false);
    }

    if (brandRows.size) { const e = await sb.from("brands").upsert([...brandRows.values()]); if (e.error) { console.error("  brands:", e.error.message); continue; } }
    if (retailerRows.size) { const e = await sb.from("retailers").upsert([...retailerRows.values()]); if (e.error) console.error("  retailers:", e.error.message); }
    if (prodRows.length) { const e = await sb.from("products").upsert(prodRows); if (e.error) { console.error("  products:", e.error.message); continue; } }
    if (offerRows.length) { const e = await sb.from("product_offers").upsert(offerRows, { onConflict: "product_id,retailer_id" }); if (e.error) console.error("  offers:", e.error.message); }
    if (relRows.length) {
      const seen = new Set<string>();
      const dedup = relRows.filter((r) => { const k = `${r.original_id}|${r.dupe_id}`; if (seen.has(k)) return false; seen.add(k); return true; });
      const e = await sb.from("dupe_relationships").upsert(dedup, { onConflict: "original_id,dupe_id" }); if (e.error) console.error("  rels:", e.error.message);
      totalRels += dedup.length;
    }
    totalProducts += prodRows.length;
    console.log(`  ✓ +${prodRows.length} products, +${relRows.length} rels (running: ${totalProducts})`);
    await sleep(200);
  }

  console.log(`\n✓ Ingest complete. New products: ${totalProducts}, relationships: ${totalRels}.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
