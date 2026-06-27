// ────────────────────────────────────────────────────────────
// Rule-based dupe scorer. Deterministic, free, transparent. Used as the
// default engine and as the fallback when no Anthropic key is set.
// ────────────────────────────────────────────────────────────

import type { Product, Alternative, DupeLevel } from "../types";

function jaccard(a: string[] = [], b: string[] = []): number {
  if (!a.length || !b.length) return 0;
  const norm = (s: string) => s.toLowerCase().trim();
  const setA = new Set(a.map(norm));
  const setB = new Set(b.map(norm));
  let inter = 0;
  for (const x of setA) if (setB.has(x)) inter++;
  const union = new Set([...setA, ...setB]).size;
  return union ? inter / union : 0;
}

function attributeSimilarity(
  a: Record<string, string | boolean | number> = {},
  b: Record<string, string | boolean | number> = {}
): number {
  const keys = Object.keys(a).filter((k) => k in b);
  if (!keys.length) return 0;
  let score = 0;
  for (const k of keys) {
    const av = a[k];
    const bv = b[k];
    if (typeof av === "number" && typeof bv === "number") {
      const max = Math.max(Math.abs(av), Math.abs(bv), 1);
      score += 1 - Math.abs(av - bv) / max;
    } else if (av === bv) {
      score += 1;
    }
  }
  return score / keys.length;
}

function priceToDupeLevel(original: Product, candidate: Product): DupeLevel {
  const ratio = candidate.price / Math.max(original.price, 1);
  if (ratio <= 0.4) return "budget";
  if (ratio >= 0.9) return "premium";
  return "similar";
}

function buildReason(original: Product, candidate: Product, ing: number, attr: number, level: DupeLevel): string {
  const cheaper = original.price > candidate.price;
  const mult = cheaper ? Math.round(original.price / Math.max(candidate.price, 1)) : 0;
  if (ing >= 0.4) {
    const shared = (original.ingredients ?? []).find((i) =>
      (candidate.ingredients ?? []).some((c) => c.toLowerCase() === i.toLowerCase())
    );
    return shared
      ? `Shares the key active ${shared}${cheaper && mult > 1 ? `, ~${mult}× cheaper` : ""}`
      : `Very similar formula${cheaper && mult > 1 ? `, ~${mult}× cheaper` : ""}`;
  }
  if (attr >= 0.6) {
    return `Comparable performance and finish${cheaper && mult > 1 ? `, ~${mult}× cheaper` : ""}`;
  }
  return level === "budget"
    ? `Similar ${original.subcategory.toLowerCase()} at a fraction of the price`
    : `Comparable ${original.subcategory.toLowerCase()} with a similar profile`;
}

/** Score a single candidate against an original. Returns null if not a viable dupe. */
export function ruleScore(original: Product, candidate: Product): Alternative | null {
  if (candidate.id === original.id) return null;
  if (candidate.category !== original.category) return null; // hard gate

  const sameSub = candidate.subcategory === original.subcategory;
  const ing = jaccard(original.ingredients, candidate.ingredients);
  const attr = attributeSimilarity(original.attributes, candidate.attributes);

  // Weighted blend → 0..100
  let score =
    (sameSub ? 35 : 12) + // category/subcategory base
    ing * 45 + // ingredient overlap dominates for beauty/hair
    attr * 25; // attribute closeness

  score = Math.round(Math.min(98, Math.max(0, score)));
  if (score < 60) return null; // below threshold isn't a real dupe

  const dupeLevel = priceToDupeLevel(original, candidate);
  return {
    productId: candidate.id,
    matchScore: score,
    dupeLevel,
    reason: buildReason(original, candidate, ing, attr, dupeLevel),
  };
}

/** Rank all candidates for an original, best first. */
export function ruleMatches(original: Product, candidates: Product[]): Alternative[] {
  return candidates
    .map((c) => ruleScore(original, c))
    .filter((x): x is Alternative => x !== null)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 6);
}
