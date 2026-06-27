// ────────────────────────────────────────────────────────────
// CuratedAdapter — emits the hand-built seed catalog as RawProducts.
// This is the bootstrap data source until affiliate feeds are approved.
// To grow the catalog, extend the fixtures in src/lib/data.ts (or point
// this at data/catalog.curated.json).
// ────────────────────────────────────────────────────────────

import type { RetailerAdapter, RawProduct } from "./adapter";
import { PRODUCTS, OFFERS, RETAILERS } from "../data";

export const CuratedAdapter: RetailerAdapter = {
  id: "curated",
  network: "direct",
  async *fetchProducts() {
    for (const p of PRODUCTS) {
      const offers = OFFERS.filter((o) => o.productId === p.id);
      // One RawProduct per offer so the ingestor records every retailer link.
      // (The product upsert is idempotent on id, so duplicates merge.)
      if (offers.length === 0) {
        yield toRaw(p, null);
        continue;
      }
      for (const offer of offers) {
        yield toRaw(p, offer);
      }
    }
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toRaw(p: (typeof PRODUCTS)[number], offer: any): RawProduct {
  const retailer = offer ? RETAILERS.find((r) => r.id === offer.retailerId) : null;
  return {
    externalId: p.id,
    brandName: p.brandName,
    name: p.name,
    category: p.category,
    subcategory: p.subcategory,
    price: p.price,
    imageUrl: p.image,
    description: p.description,
    targetUser: p.targetUser,
    ingredients: p.ingredients,
    attributes: p.attributes,
    isOriginal: p.isOriginal,
    rating: p.rating,
    reviewCount: p.reviewCount,
    retailerId: offer?.retailerId ?? "brand-direct",
    retailerName: retailer?.name ?? "Brand Site",
    network: retailer?.network ?? "direct",
    productUrl: offer?.rawUrl ?? "",
  };
}
