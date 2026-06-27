// ────────────────────────────────────────────────────────────
// Affiliate URL builder. Wraps a clean retailer URL with the right
// tracking based on the retailer's network. All values are optional —
// with no IDs configured, links fall back to the raw retailer URL.
// ────────────────────────────────────────────────────────────

import type { Retailer } from "./types";

const AMAZON_TAG = process.env.AMAZON_ASSOC_TAG;
const SKIMLINKS_ID = process.env.SKIMLINKS_ID;

export function buildAffiliateUrl(rawUrl: string, retailer: Retailer): string {
  switch (retailer.network) {
    case "amazon": {
      if (!AMAZON_TAG) return rawUrl;
      const sep = rawUrl.includes("?") ? "&" : "?";
      return `${rawUrl}${sep}tag=${encodeURIComponent(AMAZON_TAG)}`;
    }
    case "skimlinks": {
      // Skimlinks auto-affiliates merchants (Sephora/Ulta/Target/Nordstrom…)
      // without per-merchant approval. Without an ID, return the raw URL.
      if (!SKIMLINKS_ID) return rawUrl;
      return `https://go.skimresources.com/?id=${encodeURIComponent(SKIMLINKS_ID)}&xs=1&url=${encodeURIComponent(rawUrl)}`;
    }
    case "rakuten":
    case "impact":
      // Deep-link templates plug in here once those networks approve the
      // publisher account. Until then, send users straight to the retailer.
      return rawUrl;
    case "direct":
    default:
      return rawUrl;
  }
}

/** FTC affiliate disclosure copy, reused across the UI. */
export const AFFILIATE_DISCLOSURE =
  "DupeDose may earn a commission when you buy through links on our site, at no extra cost to you.";
