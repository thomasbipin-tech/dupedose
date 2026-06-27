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

export async function getAllProducts(): Promise<Product[]> {
  const sb = supabaseAnon();
  if (sb) {
    const { data } = await sb.from("products").select("*").order("rating", { ascending: false });
    return (data ?? []).map(rowToProduct);
  }
  return PRODUCTS;
}

// Same-category fallback so a product page is NEVER empty when there are no
// curated dupes. These are clearly framed as "popular alternatives" (modest
// score) — the Claude algorithm replaces them with true scored dupes later.
function fallbackDupeLevel(anchorPrice: number, candidatePrice: number): DupeLevel {
  const ratio = candidatePrice / Math.max(anchorPrice, 1);
  if (ratio <= 0.6) return "budget";
  if (ratio >= 1.1) return "premium";
  return "similar";
}
function toFallbackAlt(anchor: Product, p: Product): AlternativeProduct {
  const level = fallbackDupeLevel(anchor.price, p.price);
  const sub = anchor.subcategory.toLowerCase();
  const reason =
    level === "budget" ? `More affordable ${sub} with a similar profile`
    : level === "premium" ? `Higher-end ${sub} with comparable results`
    : `Popular ${sub} alternative`;
  return { ...p, matchScore: 72, dupeLevel: level, reason };
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
    const curated = (data ?? [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((row: any) => {
        const dupe = Array.isArray(row.dupe) ? row.dupe[0] : row.dupe;
        if (!dupe) return null;
        return { ...rowToProduct(dupe), matchScore: row.match_score, dupeLevel: row.dupe_level, reason: row.reason };
      })
      .filter(Boolean) as AlternativeProduct[];
    if (curated.length >= ALT_TARGET || !anchor) return curated.slice(0, ALT_TARGET);
    // Top up with same-category alternatives so the page feels complete.
    const { data: cand } = await sb
      .from("products")
      .select("*")
      .eq("category", anchor.category)
      .neq("id", productId)
      .order("rating", { ascending: false })
      .limit(20);
    const exclude = new Set(curated.map((c) => c.id));
    const fill = rankCandidates(anchor, (cand ?? []).map(rowToProduct), exclude, ALT_TARGET - curated.length).map((p) => toFallbackAlt(anchor, p));
    return [...curated, ...fill];
  }
  // Seed fallback (no DB)
  const alts = ALTERNATIVES[productId] ?? [];
  const curated = alts
    .map((alt) => {
      const product = PRODUCTS.find((p) => p.id === alt.productId);
      if (!product) return null;
      return { ...product, matchScore: alt.matchScore, dupeLevel: alt.dupeLevel, reason: alt.reason };
    })
    .filter(Boolean) as AlternativeProduct[];
  if (curated.length >= ALT_TARGET || !anchor) return curated.slice(0, ALT_TARGET);
  const exclude = new Set(curated.map((c) => c.id));
  const fill = rankCandidates(anchor, PRODUCTS.filter((p) => p.category === anchor.category), exclude, ALT_TARGET - curated.length).map((p) => toFallbackAlt(anchor, p));
  return [...curated, ...fill];
}

export async function searchProducts(query: string): Promise<Product[]> {
  const q = query.trim();
  if (!q) return getAllProducts();
  const sb = supabaseAnon();
  if (sb) {
    const like = `%${q}%`;
    const { data } = await sb
      .from("products")
      .select("*")
      .or(`name.ilike.${like},brand_name.ilike.${like},subcategory.ilike.${like},description.ilike.${like},category.ilike.${like}`)
      .order("rating", { ascending: false });
    return (data ?? []).map(rowToProduct);
  }
  const lower = q.toLowerCase();
  return PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(lower) ||
      p.brandName.toLowerCase().includes(lower) ||
      p.category.toLowerCase().includes(lower) ||
      p.subcategory.toLowerCase().includes(lower) ||
      p.description.toLowerCase().includes(lower)
  );
}

export async function getTrendingProducts(): Promise<Product[]> {
  const sb = supabaseAnon();
  if (sb) {
    const { data } = await sb.from("products").select("*").eq("is_original", true).order("review_count", { ascending: false }).limit(6);
    if (data && data.length) return data.map(rowToProduct);
  }
  return TRENDING_PRODUCTS.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean) as Product[];
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
