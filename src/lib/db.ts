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
  Offer,
} from "./types";
import { buildAffiliateUrl } from "./affiliate";
import { RETAILERS } from "./data";

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

export async function getProductAlternatives(productId: string): Promise<AlternativeProduct[]> {
  const sb = supabaseAnon();
  if (sb) {
    const { data } = await sb
      .from("dupe_relationships")
      .select("match_score, dupe_level, reason, dupe:products!dupe_relationships_dupe_id_fkey(*)")
      .eq("original_id", productId)
      .order("match_score", { ascending: false });
    return (data ?? [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((row: any) => {
        const dupe = Array.isArray(row.dupe) ? row.dupe[0] : row.dupe;
        if (!dupe) return null;
        return { ...rowToProduct(dupe), matchScore: row.match_score, dupeLevel: row.dupe_level, reason: row.reason };
      })
      .filter(Boolean) as AlternativeProduct[];
  }
  // Fallback: seed ALTERNATIVES map
  const alts = ALTERNATIVES[productId] ?? [];
  return alts
    .map((alt) => {
      const product = PRODUCTS.find((p) => p.id === alt.productId);
      if (!product) return null;
      return { ...product, matchScore: alt.matchScore, dupeLevel: alt.dupeLevel, reason: alt.reason };
    })
    .filter(Boolean) as AlternativeProduct[];
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
      affiliateUrl: r.affiliate_url ?? r.raw_url,
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
      affiliateUrl: data.affiliate_url ?? data.raw_url,
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
