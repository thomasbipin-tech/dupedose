// ────────────────────────────────────────────────────────────
// SerpApi (Google Shopping) client + retailer mapping.
// Free tier returns ~40 real listings per search: title, price, retailer
// (source), rating, reviews, thumbnail. We turn each into a monetizable
// retailer SEARCH link for the exact product (Google's own product_link
// isn't affiliate-monetizable, so we don't use it).
// ────────────────────────────────────────────────────────────

import type { RetailerNetwork } from "../types";

const KEY = process.env.SERPAPI_KEY;

export interface ShoppingResult {
  title: string;
  source: string;          // retailer name, e.g. "Sephora", "Ulta Beauty", "Amazon.com"
  price?: number;          // extracted_price
  rating?: number;
  reviews?: number;
  thumbnail?: string;      // real product image (thumbnail res)
  productId?: string;
}

export function serpapiConfigured() {
  return Boolean(KEY);
}

/** One Google Shopping search → normalized results. Throws if no key. */
export async function searchShopping(query: string, num = 40): Promise<ShoppingResult[]> {
  if (!KEY) throw new Error("SERPAPI_KEY not set");
  const url = `https://serpapi.com/search.json?engine=google_shopping&gl=us&hl=en&num=${num}&q=${encodeURIComponent(query)}&api_key=${KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`SerpApi ${res.status}: ${await res.text()}`);
  const data = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[] = data.shopping_results ?? [];
  return rows
    .map((r) => ({
      title: r.title as string,
      source: (r.source as string) ?? "",
      price: typeof r.extracted_price === "number" ? r.extracted_price : undefined,
      rating: typeof r.rating === "number" ? r.rating : undefined,
      reviews: typeof r.reviews === "number" ? r.reviews : undefined,
      thumbnail: r.thumbnail as string | undefined,
      productId: r.product_id as string | undefined,
    }))
    .filter((r) => r.title);
}

interface RetailerInfo {
  retailerId: string;
  retailerName: string;
  network: RetailerNetwork;
  searchUrl: (query: string) => string;
}

const enc = encodeURIComponent;
const KNOWN: { test: RegExp; info: Omit<RetailerInfo, "searchUrl"> & { searchUrl: (q: string) => string } }[] = [
  { test: /amazon/i, info: { retailerId: "amazon", retailerName: "Amazon", network: "amazon", searchUrl: (q) => `https://www.amazon.com/s?k=${enc(q)}` } },
  { test: /sephora/i, info: { retailerId: "sephora", retailerName: "Sephora", network: "skimlinks", searchUrl: (q) => `https://www.sephora.com/search?keyword=${enc(q)}` } },
  { test: /ulta/i, info: { retailerId: "ulta", retailerName: "Ulta Beauty", network: "skimlinks", searchUrl: (q) => `https://www.ulta.com/shop/search?Ntt=${enc(q)}` } },
  { test: /target/i, info: { retailerId: "target", retailerName: "Target", network: "skimlinks", searchUrl: (q) => `https://www.target.com/s?searchTerm=${enc(q)}` } },
  { test: /nordstrom/i, info: { retailerId: "nordstrom", retailerName: "Nordstrom", network: "skimlinks", searchUrl: (q) => `https://www.nordstrom.com/sr?keyword=${enc(q)}` } },
  { test: /walmart/i, info: { retailerId: "walmart", retailerName: "Walmart", network: "skimlinks", searchUrl: (q) => `https://www.walmart.com/search?q=${enc(q)}` } },
  { test: /macy/i, info: { retailerId: "macys", retailerName: "Macy's", network: "skimlinks", searchUrl: (q) => `https://www.macys.com/shop/search?keyword=${enc(q)}` } },
];

/** Map a Google Shopping "source" to a retailer + a monetizable search URL. */
export function mapSource(source: string): RetailerInfo {
  for (const k of KNOWN) if (k.test.test(source)) return k.info;
  // Unknown retailer/brand site → Amazon search (guaranteed to resolve + monetized by tag).
  return { retailerId: "amazon", retailerName: "Amazon", network: "amazon", searchUrl: (q) => `https://www.amazon.com/s?k=${enc(q)}` };
}
