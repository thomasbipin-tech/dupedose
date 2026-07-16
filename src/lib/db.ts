// ────────────────────────────────────────────────────────────
// Data access layer. Same function names the pages already use, now
// async. Queries Supabase when configured; otherwise falls back to the
// in-memory seed fixtures in ./data so the site works with zero setup.
// ────────────────────────────────────────────────────────────

import { supabaseAnon } from "./supabase";
import {
  PRODUCTS,
  ALTERNATIVES,
  OFFERS,
  TRENDING_PRODUCTS,
  BRANDS,
  CATEGORIES,
} from "./data";
import type {
  Product,
  Category,
  AlternativeProduct,
  DupeLevel,
  Offer,
  RetailerNetwork,
} from "./types";
import { buildAffiliateUrl } from "./affiliate";
import { RETAILERS } from "./data";

// Build the affiliate URL at REQUEST time from the live env vars (Amazon tag,
// Skimlinks id) — never trust a value baked into the DB at seed time, so the
// tag updates the moment the env var changes (no re-seed needed).
function liveAffiliateUrl(rawUrl: string, retailerId: string, network: string, name: string): string {
  return buildAffiliateUrl(rawUrl, { id: retailerId, name, homepage: "", network: (network as RetailerNetwork) ?? "direct" });
}

// ── snake_case row → camelCase Product mapper ──────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToProduct(r: any): Product {
  return {
    id: r.id,
    brandId: r.brand_id,
    brandName: r.brand_name,
    name: r.name,
    category: r.category,
    subcategory: r.subcategory,
    price: Number(r.price),
    image: r.image,
    rating: Number(r.rating),
    reviewCount: r.review_count,
    description: r.description,
    targetUser: r.target_user,
    ingredients: r.ingredients ?? undefined,
    attributes: r.attributes ?? undefined,
    isOriginal: r.is_original ?? undefined,
    slug: r.slug,
  };
}

// ── Reads ──────────────────────────────────────────────────────

export async function getProduct(id: string): Promise<Product | null> {
  const sb = supabaseAnon();
  if (sb) {
    const { data } = await sb.from("products").select("*").eq("id", id).maybeSingle();
    return data ? rowToProduct(data) : null;
  }
  return PRODUCTS.find((p) => p.id === id) ?? null;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const sb = supabaseAnon();
  if (sb) {
    const { data } = await sb.from("products").select("*").eq("slug", slug).maybeSingle();
    return data ? rowToProduct(data) : null;
  }
  return PRODUCTS.find((p) => p.slug === slug) ?? null;
}

export async function getProductsByCategory(category: Category): Promise<Product[]> {
  const sb = supabaseAnon();
  if (sb) {
    const { data } = await sb.from("products").select("*").eq("category", category).order("rating", { ascending: false });
    return (data ?? []).map(rowToProduct);
  }
  return PRODUCTS.filter((p) => p.category === category);
}

/** For a dupe product: the original it dupes (best match), with the forward
 *  "why it's a dupe" reason. Null for originals/catalog extras. */
export async function getOriginalFor(productId: string): Promise<{ product: Product; matchScore: number; reason: string } | null> {
  const sb = supabaseAnon();
  if (!sb) return null;
  const { data: rels } = await sb
    .from("dupe_relationships")
    .select("original_id,match_score,reason")
    .eq("dupe_id", productId)
    .order("match_score", { ascending: false })
    .limit(5);
  for (const r of rels ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = r as any;
    const { data: p } = await sb.from("products").select("*").eq("id", row.original_id).eq("is_original", true).maybeSingle();
    if (p) return { product: rowToProduct(p), matchScore: row.match_score, reason: row.reason };
  }
  return null;
}

/** Fetch products for a UI collection (one or more categories, optionally narrowed by subcategory). */
export async function getProductsByCollection(cats: string[], subs?: string[]): Promise<Product[]> {
  const sb = supabaseAnon();
  if (sb) {
    let q = sb.from("products").select("*").in("category", cats);
    if (subs && subs.length) q = q.in("subcategory", subs);
    const { data } = await q.order("rating", { ascending: false });
    return (data ?? []).map(rowToProduct);
  }
  return PRODUCTS.filter((p) => cats.includes(p.category) && (!subs || subs.includes(p.subcategory)));
}

export async function getBrandBySlug(slug: string): Promise<{ id: string; name: string; category: Category } | null> {
  const sb = supabaseAnon();
  if (sb) {
    const { data } = await sb.from("brands").select("id,name,category").eq("id", slug).maybeSingle();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data ? (data as any) : null;
  }
  const b = BRANDS.find((b) => b.id === slug);
  return b ? { id: b.id, name: b.name, category: b.category } : null;
}

export async function getProductsByBrand(brandId: string): Promise<Product[]> {
  const sb = supabaseAnon();
  if (sb) {
    const { data } = await sb
      .from("products")
      .select("*")
      .eq("brand_id", brandId)
      .order("is_original", { ascending: false })
      .order("review_count", { ascending: false });
    return (data ?? []).map(rowToProduct);
  }
  return PRODUCTS.filter((p) => p.brandId === brandId);
}

/** Brands that have at least one "original" — good "Best X Dupes" guide pages. */
export async function getGuideBrands(): Promise<{ id: string; name: string; count: number }[]> {
  const sb = supabaseAnon();
  if (sb) {
    const { data } = await sb.from("products").select("brand_id,brand_name").eq("is_original", true).neq("category", "jewelry");
    const m = new Map<string, { id: string; name: string; count: number }>();
    for (const r of data ?? []) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const row = r as any;
      const e = m.get(row.brand_id) ?? { id: row.brand_id, name: row.brand_name, count: 0 };
      e.count++;
      m.set(row.brand_id, e);
    }
    return [...m.values()].sort((a, b) => b.count - a.count);
  }
  const m = new Map<string, { id: string; name: string; count: number }>();
  for (const p of PRODUCTS.filter((p) => p.isOriginal)) {
    const e = m.get(p.brandId) ?? { id: p.brandId, name: p.brandName, count: 0 };
    e.count++;
    m.set(p.brandId, e);
  }
  return [...m.values()].sort((a, b) => b.count - a.count);
}

export async function getAllProducts(): Promise<Product[]> {
  const sb = supabaseAnon();
  if (sb) {
    const { data } = await sb.from("products").select("*").neq("category", "jewelry").order("rating", { ascending: false });
    return (data ?? []).map(rowToProduct);
  }
  return PRODUCTS.filter((p) => p.category !== "jewelry");
}

// Same-category fallback so a product page is NEVER empty when there are no
// curated dupes. These are clearly framed as "popular alternatives" (modest
// score) — the Claude algorithm replaces them with true scored dupes later.
function fallbackDupeLevel(anchorPrice: number, candidatePrice: number): DupeLevel {
  // Small absolute gaps aren't a tier difference ($8 vs $10 isn't "premium").
  if (Math.abs(candidatePrice - anchorPrice) < 5) return "similar";
  const ratio = candidatePrice / Math.max(anchorPrice, 1);
  if (ratio <= 0.6) return "budget";
  if (ratio >= 1.1) return "premium";
  return "similar";
}
function toFallbackAlt(anchor: Product, p: Product): AlternativeProduct {
  const level = fallbackDupeLevel(anchor.price, p.price);
  const sub = anchor.subcategory.toLowerCase();
  const reason =
    level === "budget" ? `${p.brandName}'s budget take on the same ${sub} brief`
    : level === "premium" ? `${p.brandName}'s pricier spin on this ${sub} — for when you want the upgrade`
    : `${p.brandName}'s take on the same ${sub}, at a similar spend`;
  return { ...p, matchScore: 72, dupeLevel: level, reason };
}
// Keep the reason wording consistent with the price-derived tier so a pricier
// pick never reads as "cheaper" (and vice-versa).
function coherentReason(level: DupeLevel, sub: string, stored: string): string {
  const cheap = /cheaper|fraction|affordable|budget|for less|lower price|less expensive|save/i;
  const lux = /higher[- ]end|premium|luxury|pricier|splurge|original/i;
  if (level === "premium" && cheap.test(stored)) return `The pricier pick here — same ${sub} payoff if you'd rather splurge`;
  if (level === "budget" && lux.test(stored)) return `The budget route to the same ${sub} result`;
  return stored;
}
// Re-tier a curated alternative by ACTUAL price vs the page's anchor, so labels
// always match reality (e.g. a $4,460 pick on a cheaper page reads "Premium").
function retier(anchor: Product, alt: AlternativeProduct): AlternativeProduct {
  const level = fallbackDupeLevel(anchor.price, alt.price);
  return { ...alt, dupeLevel: level, reason: coherentReason(level, anchor.subcategory.toLowerCase(), alt.reason) };
}
// Drop near-duplicate alternatives (same brand + essentially the same name) and cap.
function normKey(p: { brandName: string; name: string }) {
  return `${p.brandName} ${p.name}`.toLowerCase().replace(/\b(women'?s|men'?s|set|kit)\b/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}
function finalizeAlts(list: AlternativeProduct[]): AlternativeProduct[] {
  const seen = new Set<string>();
  const out: AlternativeProduct[] = [];
  for (const a of list) {
    const k = normKey(a);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(a);
  }
  return out.slice(0, ALT_TARGET);
}
const ALT_TARGET = 6;
function rankCandidates(anchor: Product, candidates: Product[], excludeIds: Set<string>, limit: number): Product[] {
  return candidates
    .filter((p) => p.id !== anchor.id && !excludeIds.has(p.id))
    .sort((a, b) => {
      const aSub = a.subcategory === anchor.subcategory ? 1 : 0;
      const bSub = b.subcategory === anchor.subcategory ? 1 : 0;
      if (aSub !== bSub) return bSub - aSub; // same-subcategory first
      return b.rating - a.rating;
    })
    .slice(0, limit);
}

export async function getProductAlternatives(productId: string): Promise<AlternativeProduct[]> {
  const sb = supabaseAnon();
  const anchor = await getProduct(productId);
  if (sb) {
    const { data } = await sb
      .from("dupe_relationships")
      .select("match_score, dupe_level, reason, dupe:products!dupe_relationships_dupe_id_fkey(*)")
      .eq("original_id", productId)
      .order("match_score", { ascending: false });
    let curated = (data ?? [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((row: any) => {
        const dupe = Array.isArray(row.dupe) ? row.dupe[0] : row.dupe;
        if (!dupe) return null;
        return { ...rowToProduct(dupe), matchScore: row.match_score, dupeLevel: row.dupe_level, reason: row.reason };
      })
      .filter(Boolean) as AlternativeProduct[];
    if (anchor) curated = curated.map((a) => retier(anchor, a));
    if (curated.length >= ALT_TARGET || !anchor) return finalizeAlts(curated);
    // Top up ONLY with the same SUBCATEGORY (e.g. lipstick→lipsticks, never
    // lipstick→serum). Showing fewer, relevant items beats padding with
    // mismatched ones. Excludes the curated dupes + the original.
    const { data: cand } = await sb
      .from("products")
      .select("*")
      .eq("category", anchor.category)
      .eq("subcategory", anchor.subcategory)
      .neq("id", productId)
      .order("review_count", { ascending: false })
      .limit(20);
    const exclude = new Set(curated.map((c) => c.id));
    const fill = rankCandidates(anchor, (cand ?? []).map(rowToProduct), exclude, ALT_TARGET - curated.length).map((p) => toFallbackAlt(anchor, p));
    return finalizeAlts([...curated, ...fill]);
  }
  // Seed fallback (no DB)
  const alts = ALTERNATIVES[productId] ?? [];
  let curated = alts
    .map((alt) => {
      const product = PRODUCTS.find((p) => p.id === alt.productId);
      if (!product) return null;
      return { ...product, matchScore: alt.matchScore, dupeLevel: alt.dupeLevel, reason: alt.reason };
    })
    .filter(Boolean) as AlternativeProduct[];
  if (anchor) curated = curated.map((a) => retier(anchor, a));
  if (curated.length >= ALT_TARGET || !anchor) return finalizeAlts(curated);
  const exclude = new Set(curated.map((c) => c.id));
  const fill = rankCandidates(anchor, PRODUCTS.filter((p) => p.category === anchor.category && p.subcategory === anchor.subcategory), exclude, ALT_TARGET - curated.length).map((p) => toFallbackAlt(anchor, p));
  return finalizeAlts([...curated, ...fill]);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const q = query.trim();
  if (!q) return getAllProducts();
  const sb = supabaseAnon();
  if (sb) {
    const byId = new Map<string, Product>();
    // 1) Full-text search (word/stem match) — "Ring" matches the word ring/rings,
    //    "watches" matches watch; NO substring noise from descriptions.
    try {
      const { data: fts } = await sb
        .from("products")
        .select("*")
        .neq("category", "jewelry") // jewelry is delisted
        .textSearch("search_vector", q, { type: "websearch" })
        .order("review_count", { ascending: false })
        .limit(80);
      for (const r of fts ?? []) byId.set(r.id, rowToProduct(r));
    } catch {
      /* malformed query — fall through to ILIKE */
    }
    // 2) WORD-BOUNDARY partial on NAME/BRAND/SUBCATEGORY (so "cera"→CeraVe and
    //    "ring"→"Trinity Ring" work, but never mid-word like "Repai[ring]").
    const safe = q.replace(/[%,()*]/g, "").trim();
    if (safe) {
      const orFilter = ["name", "brand_name", "subcategory"]
        .flatMap((f) => [`${f}.ilike.${safe}%`, `${f}.ilike.% ${safe}%`])
        .join(",");
      const { data: il } = await sb
        .from("products")
        .select("*")
        .neq("category", "jewelry") // jewelry is delisted
        .or(orFilter)
        .order("review_count", { ascending: false })
        .limit(80);
      for (const r of il ?? []) if (!byId.has(r.id)) byId.set(r.id, rowToProduct(r));
    }
    return [...byId.values()];
  }
  // Seed fallback (no DB): word-boundary match on name/brand/subcategory only.
  const re = new RegExp(`\\b${q.replace(/[^a-z0-9 ]/gi, "")}`, "i");
  return PRODUCTS.filter(
    (p) => p.category !== "jewelry" && (re.test(p.name) || re.test(p.brandName) || re.test(p.subcategory))
  );
}

export async function getTrendingProducts(): Promise<Product[]> {
  const sb = supabaseAnon();
  if (sb) {
    // Trending = originals people hunt dupes FOR — premium anchors only.
    const { data } = await sb.from("products").select("*").eq("is_original", true).neq("category", "jewelry").gte("price", 25).order("review_count", { ascending: false }).limit(12);
    if (data && data.length) return data.map(rowToProduct);
  }
  return TRENDING_PRODUCTS.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean) as Product[];
}

/** Category options (slug + label) for menus/dropdowns. DB-backed with seed fallback. */
export async function getCategories(): Promise<{ slug: string; label: string }[]> {
  const sb = supabaseAnon();
  if (sb) {
    const { data } = await sb.from("categories").select("slug,label").order("sort_order", { ascending: true });
    if (data && data.length) return data as { slug: string; label: string }[];
  }
  return CATEGORIES.map((c) => ({ slug: c.slug, label: c.label }));
}

export async function getAllProductSlugs(): Promise<{ slug: string }[]> {
  const sb = supabaseAnon();
  if (sb) {
    const { data } = await sb.from("products").select("slug");
    return (data ?? []).map((r: { slug: string }) => ({ slug: r.slug }));
  }
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function getProductOffers(productId: string): Promise<Offer[]> {
  const sb = supabaseAnon();
  if (sb) {
    const { data } = await sb
      .from("product_offers")
      .select("*, retailer:retailers(*)")
      .eq("product_id", productId)
      .order("price", { ascending: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []).map((r: any) => ({
      id: r.id,
      productId: r.product_id,
      retailerId: r.retailer_id,
      retailerName: r.retailer?.name ?? r.retailer_id,
      network: r.retailer?.network ?? "direct",
      rawUrl: r.raw_url,
      affiliateUrl: liveAffiliateUrl(r.raw_url, r.retailer_id, r.retailer?.network ?? "direct", r.retailer?.name ?? r.retailer_id),
      price: r.price ? Number(r.price) : undefined,
      currency: r.currency ?? "USD",
      inStock: r.in_stock ?? true,
    }));
  }
  // Fallback: build affiliate URLs on the fly from seed offers
  return OFFERS.filter((o) => o.productId === productId)
    .map((o) => {
      const retailer = RETAILERS.find((r) => r.id === o.retailerId);
      return { ...o, affiliateUrl: retailer ? buildAffiliateUrl(o.rawUrl, retailer) : o.rawUrl };
    })
    .sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
}

/** Look up a single offer by id (used by the redirect route). */
export async function getOffer(offerId: string): Promise<Offer | null> {
  const sb = supabaseAnon();
  if (sb) {
    const { data } = await sb
      .from("product_offers")
      .select("*, retailer:retailers(*)")
      .eq("id", offerId)
      .maybeSingle();
    if (!data) return null;
    return {
      id: data.id,
      productId: data.product_id,
      retailerId: data.retailer_id,
      retailerName: data.retailer?.name ?? data.retailer_id,
      network: data.retailer?.network ?? "direct",
      rawUrl: data.raw_url,
      affiliateUrl: liveAffiliateUrl(data.raw_url, data.retailer_id, data.retailer?.network ?? "direct", data.retailer?.name ?? data.retailer_id),
      price: data.price ? Number(data.price) : undefined,
      currency: data.currency ?? "USD",
      inStock: data.in_stock ?? true,
    };
  }
  const o = OFFERS.find((x) => x.id === offerId);
  if (!o) return null;
  const retailer = RETAILERS.find((r) => r.id === o.retailerId);
  return { ...o, affiliateUrl: retailer ? buildAffiliateUrl(o.rawUrl, retailer) : o.rawUrl };
}
