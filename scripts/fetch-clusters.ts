// ────────────────────────────────────────────────────────────
// Phase 1 of the session-ranked pipeline (no Anthropic API needed):
// fetch raw SerpApi listings for a batch of intents and dump them to JSON.
// Claude (in a Claude Code session) then authors the RankResult judgments,
// and scripts/ingest-ranked.ts upserts the result.
//
//   OFFSET=47 LIMIT=12 npm run fetch-clusters
//   → .ingest-batches/raw-47-12.json
// ────────────────────────────────────────────────────────────

import { mkdirSync, writeFileSync } from "fs";
import { INTENTS } from "../src/lib/ingest/intents";
import { searchShopping, serpapiConfigured, type ShoppingResult } from "../src/lib/ingest/serpapi";
import type { DupeIntent } from "../src/lib/ingest/intents";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface RawCluster {
  intent: DupeIntent;
  original: ShoppingResult;
  candidates: ShoppingResult[];
}

async function main() {
  if (!serpapiConfigured()) { console.error("✗ SERPAPI_KEY not set."); process.exit(1); }
  const offset = process.env.OFFSET ? parseInt(process.env.OFFSET, 10) : 0;
  const limit = process.env.LIMIT ? parseInt(process.env.LIMIT, 10) : 10;
  // Jewelry is delisted from the site — never spend searches on it.
  const intents = INTENTS.slice(offset, offset + limit).filter((i) => i.category !== "jewelry");
  console.log(`→ Fetching ${intents.length} intent(s) from offset ${offset} (${intents.length * 2} SerpApi searches)`);

  const clusters: RawCluster[] = [];
  let searches = 0;
  for (const intent of intents) {
    console.log(`  ${intent.originalQuery}`);
    try {
      const originalRes = await searchShopping(intent.originalQuery); searches++;
      const candidates = await searchShopping(intent.discoveryQuery); searches++;
      if (!originalRes.length) { console.log("    no original results, skip"); continue; }
      clusters.push({ intent, original: originalRes[0], candidates });
    } catch (e) {
      console.error("    search error:", (e as Error).message);
    }
    await sleep(400);
  }

  mkdirSync(".ingest-batches", { recursive: true });
  const file = `.ingest-batches/raw-${offset}-${limit}.json`;
  writeFileSync(file, JSON.stringify(clusters, null, 1));
  console.log(`\n✓ Wrote ${clusters.length} cluster(s) to ${file}. SerpApi searches used: ${searches}.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
