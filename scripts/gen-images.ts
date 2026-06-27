// ────────────────────────────────────────────────────────────
// Generate an editorial branded SVG tile per product into
// public/products/<id>.svg. Deterministic, no external deps, no broken
// links. Run after adding products:  npm run gen-images
// Real feed photos override these automatically (see src/lib/images.ts).
// ────────────────────────────────────────────────────────────

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { PRODUCTS, CATEGORIES } from "../src/lib/data";
import type { Product } from "../src/lib/types";

const OUT = join(process.cwd(), "public", "products");

const PALETTE: Record<string, { c: string; bg: string; bg2: string; glyph: string }> = {
  beauty: { c: "#9e3a52", bg: "#f9e6ec", bg2: "#f0c9d5", glyph: "✦" },
  hair: { c: "#9e7a2a", bg: "#f7efd9", bg2: "#ecd9a8", glyph: "◈" },
  jewelry: { c: "#5b21b6", bg: "#efe9fd", bg2: "#dccdf6", glyph: "◇" },
};

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function wrap(text: string, max: number, maxLines: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max) {
      if (cur) lines.push(cur.trim());
      cur = w;
      if (lines.length === maxLines - 1) break;
    } else {
      cur = (cur + " " + w).trim();
    }
  }
  if (cur && lines.length < maxLines) lines.push(cur.trim());
  // append remaining as ellipsis if truncated
  if (lines.length === maxLines) {
    const used = lines.join(" ").length;
    if (used < text.length - 1) lines[maxLines - 1] = lines[maxLines - 1].replace(/\.+$/, "") + "…";
  }
  return lines;
}

function svgFor(p: Product): string {
  const pal = PALETTE[p.category] ?? PALETTE.beauty;
  const nameLines = wrap(p.name, 20, 3);
  const startY = 320 - (nameLines.length - 1) * 28;
  const nameTspans = nameLines
    .map((ln, i) => `<text x="300" y="${startY + i * 56}" text-anchor="middle" font-family="Georgia, serif" font-size="40" font-weight="700" fill="#1a1a1a">${esc(ln)}</text>`)
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600" role="img" aria-label="${esc(p.brandName)} ${esc(p.name)}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${pal.bg}"/>
      <stop offset="1" stop-color="${pal.bg2}"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#g)"/>
  <text x="300" y="430" text-anchor="middle" font-family="Georgia, serif" font-size="420" fill="${pal.c}" opacity="0.10">${pal.glyph}</text>
  <text x="40" y="70" font-family="system-ui, sans-serif" font-size="26" font-weight="600" letter-spacing="2" fill="${pal.c}">${esc(p.brandName.toUpperCase())}</text>
  ${nameTspans}
  <g>
    <rect x="40" y="520" rx="18" ry="18" width="${Math.min(520, 60 + p.subcategory.length * 13)}" height="40" fill="${pal.c}"/>
    <text x="${40 + Math.min(520, 60 + p.subcategory.length * 13) / 2}" y="546" text-anchor="middle" font-family="system-ui, sans-serif" font-size="20" font-weight="600" fill="#ffffff">${esc(p.subcategory)}</text>
  </g>
  ${p.isOriginal ? `<g><circle cx="540" cy="60" r="26" fill="${pal.c}"/><text x="540" y="68" text-anchor="middle" font-family="system-ui, sans-serif" font-size="22" fill="#fff">★</text></g>` : ""}
</svg>`;
}

function main() {
  mkdirSync(OUT, { recursive: true });
  let n = 0;
  for (const p of PRODUCTS) {
    writeFileSync(join(OUT, `${p.id}.svg`), svgFor(p), "utf8");
    n++;
  }
  console.log(`✓ Generated ${n} product images into public/products/ (${CATEGORIES.length} categories).`);
}

main();
