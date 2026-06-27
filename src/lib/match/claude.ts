// ────────────────────────────────────────────────────────────
// Claude-backed dupe scorer. Runs at INGESTION time (batch) and caches
// results in the DB — never per page view. Falls back to rules.ts when
// no ANTHROPIC_API_KEY is set. Model id is a single config constant.
// ────────────────────────────────────────────────────────────

import Anthropic from "@anthropic-ai/sdk";
import type { Product, Alternative, DupeLevel } from "../types";
import { ruleMatches } from "./rules";

// Confirm the exact current model id via the claude-api skill at wire-time.
const MODEL = "claude-opus-4-8";
export const CLAUDE_ENGINE_VERSION = `${MODEL}-v1`;

function compact(p: Product) {
  return {
    id: p.id,
    brand: p.brandName,
    name: p.name,
    category: p.category,
    subcategory: p.subcategory,
    price: p.price,
    ingredients: p.ingredients ?? [],
    attributes: p.attributes ?? {},
  };
}

const TOOL = {
  name: "report_dupes",
  description: "Report which candidate products are good dupes of the original, with scores and reasons.",
  input_schema: {
    type: "object" as const,
    properties: {
      matches: {
        type: "array",
        items: {
          type: "object",
          properties: {
            productId: { type: "string", description: "id of the candidate" },
            matchScore: { type: "number", description: "0-100 how close a dupe it is" },
            dupeLevel: { type: "string", enum: ["premium", "similar", "budget"] },
            reason: { type: "string", description: "one concise sentence on why it's a dupe" },
          },
          required: ["productId", "matchScore", "dupeLevel", "reason"],
        },
      },
    },
    required: ["matches"],
  },
};

/**
 * Score candidates for one original via Claude. Batches all candidates into a
 * single tool-use call. Falls back to rule scoring on any error / missing key.
 */
export async function claudeMatches(original: Product, candidates: Product[]): Promise<Alternative[]> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return ruleMatches(original, candidates);

  const pool = candidates.filter((c) => c.id !== original.id && c.category === original.category);
  if (!pool.length) return [];

  try {
    const client = new Anthropic({ apiKey: key });
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      tools: [TOOL],
      tool_choice: { type: "tool", name: "report_dupes" },
      messages: [
        {
          role: "user",
          content:
            "You are a beauty/hair/jewelry product expert. Given an ORIGINAL product and CANDIDATE alternatives, " +
            "identify which candidates are genuine dupes. Score 0-100 by similarity of ingredients/actives, " +
            "performance, finish, and overall effect. Set dupeLevel by price: 'budget' if much cheaper, " +
            "'premium' if comparable/pricier, else 'similar'. Only include candidates scoring >= 60.\n\n" +
            `ORIGINAL:\n${JSON.stringify(compact(original))}\n\n` +
            `CANDIDATES:\n${JSON.stringify(pool.map(compact))}`,
        },
      ],
    });

    const block = msg.content.find((b) => b.type === "tool_use");
    if (!block || block.type !== "tool_use") return ruleMatches(original, candidates);
    const out = block.input as { matches: Alternative[] };
    const validIds = new Set(pool.map((p) => p.id));
    return (out.matches ?? [])
      .filter((m) => validIds.has(m.productId))
      .map((m) => ({
        productId: m.productId,
        matchScore: Math.round(m.matchScore),
        dupeLevel: (["premium", "similar", "budget"].includes(m.dupeLevel) ? m.dupeLevel : "similar") as DupeLevel,
        reason: m.reason,
      }))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 6);
  } catch {
    return ruleMatches(original, candidates);
  }
}
