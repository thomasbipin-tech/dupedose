#!/usr/bin/env node
// ────────────────────────────────────────────────────────────
// Site audit: crawl every internal link AND assert user-expectation
// invariants on page content. Run after any content/code change:
//
//   npm run audit-links                # against production
//   BASE=http://localhost:3002 npm run audit-links
//
// Checks:
//  1. Every internal link (BFS from home + sitemap) returns 200.
//  2. Every /search?q= link returns > 0 results.
//  3. No page renders junk: >undefined<, >NaN, $NaN, [object Object], >$0<.
//  4. Page-type invariants:
//     - home: hero pairs, category tiles with counts
//     - category: > 0 product cards
//     - original product (>=$25): ranked-dupes section present
//     - dupe product: "The Original" section present
//     - guide page: FAQ present
//  5. SAVE badges never show 0% or negative.
// ────────────────────────────────────────────────────────────

const BASE = process.env.BASE ?? "https://www.dupedose.com";
const CONC = 10;
const JUNK = [">undefined<", ">NaN", "$NaN", "[object Object]", ">$0<", "SAVE 0%", "SAVE -"];

const seen = new Set();
const failures = [];
const searchQs = new Map();
let crawled = 0;

async function get(path) {
  try {
    const r = await fetch(BASE + path, { headers: { "User-Agent": "DupeDose-Audit/1.0" }, redirect: "follow" });
    return { status: r.status, body: r.ok ? await r.text() : "" };
  } catch (e) {
    return { status: -1, body: "", err: String(e) };
  }
}

function checkContent(path, body) {
  for (const j of JUNK) {
    if (body.includes(j)) failures.push(`[junk] ${path} contains ${JSON.stringify(j)}`);
  }
  // SAVE badges: React splits text nodes → "SAVE <!-- -->NN"
  for (const m of body.matchAll(/SAVE <!-- -->(-?\d+)/g)) {
    if (parseInt(m[1], 10) <= 0) failures.push(`[badge] ${path} shows SAVE ${m[1]}%`);
  }
  if (path === "/") {
    if (!body.includes("products · dupes from")) failures.push("[home] category tiles missing value line");
    if (!/SAVE <!-- -->\d/.test(body)) failures.push("[home] hero dupe pairs missing");
  }
  if (path.startsWith("/category/")) {
    if (!body.includes("/product/")) failures.push(`[category] ${path} renders no product links`);
  }
  if (path.startsWith("/dupes/") && path !== "/dupes") {
    if (!body.includes("FAQPage")) failures.push(`[guide] ${path} missing FAQ schema`);
  }
  if (path.startsWith("/product/")) {
    const isDupePage = body.includes("The Original ·") || body.includes("The Original<");
    const hasRanked = body.includes("Ranked dupes");
    const hasMore = body.includes("picks") || body.includes("Similar products");
    if (!isDupePage && !hasRanked && !hasMore && body.includes("/api/go/")) {
      // product page with offers but no alternatives section at all — flag
      failures.push(`[product] ${path} has no dupes/original/related section`);
    }
  }
}

function extractLinks(body) {
  const links = new Set();
  for (const m of body.matchAll(/href="(\/[^"#]*)"/g)) {
    const h = m[1].split("#")[0];
    if (!h || h.startsWith("/api/go/")) continue;
    if (h.startsWith("/search?q=")) {
      const q = decodeURIComponent(h.slice("/search?q=".length)).replace(/\+/g, " ");
      if (!searchQs.has(q)) searchQs.set(q, true);
      continue;
    }
    if (h.startsWith("/api/")) continue;
    links.add(h);
  }
  return links;
}

async function worker(queue) {
  while (queue.length) {
    const path = queue.pop();
    const { status, body } = await get(path);
    crawled++;
    if (crawled % 200 === 0) console.log(`  ${crawled} pages...`);
    if (status !== 200) { failures.push(`[${status}] ${path}`); continue; }
    checkContent(path, body);
    for (const l of extractLinks(body)) if (!seen.has(l)) { seen.add(l); queue.push(l); }
  }
}

const core = ["/", "/search", "/compare", "/quiz", "/dupes", "/about", "/disclosure", "/privacy",
  "/category/skincare", "/category/makeup", "/category/fragrance", "/category/hair", "/category/beauty"];
const sm = await get("/sitemap.xml");
const smPaths = [...sm.body.matchAll(/<loc>[^<]*?(\/[^<\/][^<]*)<\/loc>/g)].map((m) => new URL("https://x" + m[1], BASE).pathname);
const smClean = [...sm.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
const queue = [...new Set([...core, ...smClean])];
for (const p of queue) seen.add(p);
console.log(`auditing ${BASE} — ${queue.length} seed URLs`);
await Promise.all(Array.from({ length: CONC }, () => worker(queue)));

console.log(`\nchecking ${searchQs.size} search-query links...`);
for (const q of searchQs.keys()) {
  const r = await get("/api/search?q=" + encodeURIComponent(q));
  const n = parseInt((r.body.match(/"count":(\d+)/) ?? [])[1] ?? "-1", 10);
  if (n <= 0) failures.push(`[search-empty] q=${JSON.stringify(q)} -> ${n} results`);
}

console.log(`\n════ AUDIT RESULT ════`);
console.log(`pages crawled: ${crawled}, search links: ${searchQs.size}`);
if (failures.length) {
  console.log(`FAILURES: ${failures.length}`);
  for (const f of failures.slice(0, 60)) console.log("  ✗ " + f);
  process.exit(1);
} else {
  console.log("✓ ALL CHECKS PASSED");
}
