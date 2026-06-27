// ────────────────────────────────────────────────────────────
// Core domain types + pure helpers (no data / no network deps).
// Components import ONLY from here so they stay non-async & light.
// ────────────────────────────────────────────────────────────

export type Category = "beauty" | "hair" | "jewelry";
export type DupeLevel = "premium" | "similar" | "budget";
export type RetailerNetwork = "amazon" | "skimlinks" | "rakuten" | "impact" | "direct";

export interface Brand {
  id: string;
  name: string;
  category: Category;
  luxuryLevel: "luxury" | "mid" | "budget";
  country: string;
  priceRange: string;
  logo?: string;
}

export interface Product {
  id: string;
  brandId: string;
  brandName: string;
  name: string;
  category: Category;
  subcategory: string;
  price: number;
  image: string;
  rating: number;
  reviewCount: number;
  description: string;
  targetUser: string;
  ingredients?: string[];
  attributes?: Record<string, string | boolean | number>;
  /** True for the "luxury hero" products people search dupes for. */
  isOriginal?: boolean;
  slug: string;
}

export interface Alternative {
  productId: string;
  matchScore: number;
  dupeLevel: DupeLevel;
  reason: string;
}

export interface ProductWithAlts extends Product {
  alternatives: Alternative[];
}

/** A buy link for a product at a specific retailer (the affiliate model core). */
export interface Offer {
  id: string;
  productId: string;
  retailerId: string;
  retailerName: string;
  network: RetailerNetwork;
  /** Clean destination URL (pre-affiliate). */
  rawUrl: string;
  /** Tagged/wrapped affiliate URL the redirect route sends users to. */
  affiliateUrl: string;
  price?: number;
  currency?: string;
  inStock?: boolean;
}

export interface Retailer {
  id: string;
  name: string;
  homepage: string;
  network: RetailerNetwork;
  logo?: string;
}

/** Flattened alternative used by product pages / cards. */
export type AlternativeProduct = Product & {
  matchScore: number;
  dupeLevel: DupeLevel;
  reason: string;
};

/** Compact offer spec used by seed fixtures (expanded into Offer[]). */
export interface OfferSpec {
  retailerId: string;
  url: string;
  price?: number;
}

// ── Pure helpers (no data dependency) ──────────────────────────

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export function dupleLevelLabel(level: DupeLevel) {
  return { premium: "Premium Dupe", similar: "Similar Pick", budget: "Budget Find" }[level];
}

export function matchScoreColor(score: number) {
  if (score >= 90) return "match-high";
  if (score >= 80) return "match-mid";
  return "match-budget";
}
