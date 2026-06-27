// ────────────────────────────────────────────────────────────
// Claude turns real Google-Shopping listings into a clean original +
// scored, explainable dupes. Uses Sonnet for cost efficiency at build time.
// ────────────────────────────────────────────────────────────

import Anthropic from "@anthropic-ai/sdk";
import type { DupeLevel } from "../types";
import type { ShoppingResult } from "./serpapi";
import type { DupeIntent } from "./intents";

const MODEL = "claude-sonnet-4-6";
export const RANK_ENGINE_VERSION = `${MODEL}-rank-v1`;

export interface RankedDupe {
  index: number;       // index into the candidate array
  brand: string;
  name: string;
  matchScore: number;  // 0-100
  dupeLevel: DupeLevel;
  reason: string;      // the logical "why it's a dupe"
}
export interface CatalogItem {
  index: number;
  brand: string;
  name: string;
}
export interface RankResult {
  originalBrand: string;
  originalName: string;
  dupes: RankedDupe[];
  catalog: CatalogItem[]; // additional vetted real products worth listing
}

const TOOL = {
  name: "report_catalog",
  description: "Report the clean original product and its best genuine dupes from the candidate listings.",
  input_schema: {
    type: "object" as const,
    properties: {
      originalBrand: { type: "string" },
      originalName: { type: "string", description: "clean product name without retailer/marketing noise" },
      dupes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            index: { type: "number", description: "0-based index into the CANDIDATES array" },
            brand: { type: "string" },
            name: { type: "string", description: "clean product name" },
            matchScore: { type: "number", description: "0-100 how good a dupe of the original" },
            dupeLevel: { type: "string", enum: ["premium", "similar", "budget"] },
            reason: { type: "string", description: "one concise sentence on the logical reason it's a dupe (shared actives/finish/effect + value)" },
          },
          required: ["index", "brand", "name", "matchScore", "dupeLevel", "reason"],
        },
      },
      catalog: {
        type: "array",
        description: "Other legitimate, distinct real products from the candidates worth listing in the catalog (same subcategory), EXCLUDING the dupes above, the original, bundles/sets/samples/refills, and duplicates. Clean brand + name only.",
        items: {
          type: "object",
          properties: {
            index: { type: "number", description: "0-based index into CANDIDATES" },
            brand: { type: "string" },
            name: { type: "string", description: "clean product name" },
          },
          required: ["index", "brand", "name"],
        },
      },
    },
    required: ["originalBrand", "originalName", "dupes", "catalog"],
  },
};

export async function rankDupes(
  intent: DupeIntent,
  original: ShoppingResult,
  candidates: ShoppingResult[]
): Promise<RankResult | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const client = new Anthropic({ apiKey: key });

  const candList = candidates.map((c, i) => ({ index: i, title: c.title, brand_guess: c.source, price: c.price ?? null, rating: c.rating ?? null }));

  try {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 2000,
      tools: [TOOL],
      tool_choice: { type: "tool", name: "report_catalog" },
      messages: [
        {
          role: "user",
          content:
            `You are a ${intent.category} product expert curating affordable "dupes" (alternatives) for a discovery site.\n` +
            `The ORIGINAL (a ${intent.subcategory}) is: "${original.title}" (price ${original.price ?? "?"}).\n` +
            `First, give the original's clean brand and product name.\n` +
            `Then from the CANDIDATES, pick up to 6 GENUINE dupes of the original. Rules:\n` +
            `- A dupe must be a real, distinct product that delivers a similar result to the original.\n` +
            `- Exclude the original itself, the same product from another retailer, bundles, accessories, and irrelevant items.\n` +
            `- Prefer a mix of price points; favor more affordable options.\n` +
            `- matchScore 0-100 = how closely it replicates the original (actives/formula/finish/effect for beauty & hair; metal/style/look for jewelry; scent profile for fragrance).\n` +
            `- dupeLevel: 'budget' if notably cheaper, 'premium' if comparable/pricier, else 'similar'.\n` +
            `- reason: ONE concise sentence with the logical backing (e.g. "Same retinol active and silky finish at a third of the price").\n` +
            `- Only include candidates scoring >= 65. Give clean brand + product name for each.\n` +
            `Finally, in "catalog", list ALL OTHER legitimate, distinct real ${intent.subcategory} products from the candidates worth listing (clean brand + name), EXCLUDING the dupes above, the original, and any bundles/sets/samples/refills/accessories or duplicate listings. Aim to include every genuine standalone product so the catalog is rich.\n\n` +
            `CANDIDATES:\n${JSON.stringify(candList)}`,
        },
      ],
    });
    const block = msg.content.find((b) => b.type === "tool_use");
    if (!block || block.type !== "tool_use") return null;
    const out = block.input as RankResult;
    out.dupes = (out.dupes ?? [])
      .filter((d) => d.index >= 0 && d.index < candidates.length)
      .map((d) => ({
        ...d,
        matchScore: Math.max(0, Math.min(100, Math.round(d.matchScore))),
        dupeLevel: (["premium", "similar", "budget"].includes(d.dupeLevel) ? d.dupeLevel : "similar") as DupeLevel,
      }))
      .slice(0, 6);
    out.catalog = (out.catalog ?? []).filter((c) => c.index >= 0 && c.index < candidates.length);
    return out;
  } catch (e) {
    console.error("  rankDupes error:", (e as Error).message);
    return null;
  }
}
