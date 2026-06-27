// ────────────────────────────────────────────────────────────
// Affiliate URL builder. Wraps a clean retailer URL with the right
// tracking based on the retailer's network. All values are optional —
// with no IDs configured, links fall back to the raw retailer URL.
// ────────────────────────────────────────────────────────────

import type { Retailer } from "./types";

const AMAZON_TAG = process.env.AMAZON_ASSOC_TAG;
const SKIMLINKS_ID = process.env.SKIMLINKS_ID;

/** Wrap any merchant URL in a Skimlinks deep link (server-side redirect-safe). */
function skimlinksWrap(rawUrl: string): string {
  if (!SKIMLINKS_ID) return rawUrl;
  return `https://go.skimresources.com/?id=${encodeURIComponent(SKIMLINKS_ID)}&xs=1&url=${encodeURIComponent(rawUrl)}`;
}

export function buildAffiliateUrl(rawUrl: string, retailer: Retailer): string {
  // Amazon uses our own Associates tag (Amazon is NOT in the Skimlinks network).
  if (retailer.network === "amazon") {
    if (!AMAZON_TAG) return rawUrl;
    const sep = rawUrl.includes("?") ? "&" : "?";
    return `${rawUrl}${sep}tag=${encodeURIComponent(AMAZON_TAG)}`;
  }

  // If you later get a DIRECT Rakuten/Impact integration, build those deep
  // links here (don't double-dip by also sending them through Skimlinks).

  // Everything else — Sephora, Ulta, Target, Nordstrom, and brand-direct sites
  // (Mejuri, Missoma, BaubleBar, etc.) — is monetized through Skimlinks, which
  // covers thousands of merchants with no per-merchant approval. Falls back to
  // the raw URL when SKIMLINKS_ID isn't set, or if the merchant isn't covered.
  return skimlinksWrap(rawUrl);
}

/** FTC + Amazon Associates affiliate disclosure copy, reused across the UI. */
export const AFFILIATE_DISCLOSURE =
  "As an Amazon Associate, DupeDose earns from qualifying purchases. We may also earn a commission from other retailers when you buy through these links, at no extra cost to you. Prices are estimates — confirm the current price on the retailer's site.";
