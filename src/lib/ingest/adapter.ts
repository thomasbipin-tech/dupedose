// ────────────────────────────────────────────────────────────
// Ingestion adapter contract — the extensibility seam.
//
// Today: CuratedAdapter (hand-built real-product catalog) + the seed
// fixtures. Later: RakutenAdapter / ImpactAdapter / AmazonCreatorsAdapter,
// each implementing this same interface. scripts/ingest.ts, the DB, and
// the site do NOT change when a new adapter is added.
// ────────────────────────────────────────────────────────────

import type { Category, RetailerNetwork } from "../types";

export interface RawProduct {
  externalId: string;
  brandName: string;
  name: string;
  category: Category;
  subcategory: string;
  price: number;
  imageUrl: string;
  description?: string;
  targetUser?: string;
  ingredients?: string[];
  attributes?: Record<string, string | boolean | number>;
  isOriginal?: boolean;
  rating?: number;
  reviewCount?: number;
  // Offer (one retailer link this product was sourced from)
  retailerId: string;
  retailerName: string;
  network: RetailerNetwork;
  productUrl: string;
}

export interface PriceUpdate {
  productId: string;
  retailerId: string;
  price: number;
  inStock: boolean;
}

export interface RetailerAdapter {
  id: string;
  network: RetailerNetwork;
  fetchProducts(opts?: { since?: Date }): AsyncIterable<RawProduct>;
  fetchPriceUpdates?(
    keys: { productId: string; retailerId: string }[]
  ): Promise<PriceUpdate[]>;
}
