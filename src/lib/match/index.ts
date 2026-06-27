// ────────────────────────────────────────────────────────────
// Match engine entry point. Selects the Claude scorer when a key is
// present, else the deterministic rule scorer. Returns Alternatives
// ready to write to the dupe_relationships table at ingestion.
// ────────────────────────────────────────────────────────────

import type { Product, Alternative } from "../types";
import { ruleMatches } from "./rules";
import { claudeMatches, CLAUDE_ENGINE_VERSION } from "./claude";

export const RULE_ENGINE_VERSION = "rule-v1";

export function activeEngineVersion(): string {
  return process.env.ANTHROPIC_API_KEY ? CLAUDE_ENGINE_VERSION : RULE_ENGINE_VERSION;
}

/** Compute ranked dupe matches for one original against a candidate pool. */
export async function computeMatches(original: Product, candidates: Product[]): Promise<Alternative[]> {
  if (process.env.ANTHROPIC_API_KEY) {
    return claudeMatches(original, candidates);
  }
  return ruleMatches(original, candidates);
}

export { ruleMatches };
