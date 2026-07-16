// ────────────────────────────────────────────────────────────
// POST /api/admin/parse-amazon-url
// Admin-only. Given a SiteStripe/Amazon URL, extracts the ASIN and
// best-effort scrapes OpenGraph + ld+json (title, image, description,
// price) so the add-product form can prefill. Rate-limited 5 req/min/IP.
// ────────────────────────────────────────────────────────────

import { NextResponse, type NextRequest } from "next/server";
import { getAdminUser } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ── In-memory sliding-window rate limiter (best-effort; per server
// instance). Enough to blunt accidental hammering from the single admin
// UI. For multi-instance hardening, back this with Upstash/Redis later.
const WINDOW_MS = 60_000;
const MAX_HITS = 5;
const hits = new Map<string, number[]>();

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_HITS) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

// ── ASIN extraction ────────────────────────────────────────────
function extractAsin(url: string): string | null {
  const patterns = [
    /\/dp\/([A-Z0-9]{10})/,
    /\/gp\/product\/([A-Z0-9]{10})/,
    /\/gp\/aw\/d\/([A-Z0-9]{10})/,
    /\/product\/([A-Z0-9]{10})/,
    /[?&]asin=([A-Z0-9]{10})/i,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1].toUpperCase();
  }
  return null;
}

// ── Lightweight meta extraction (no DOM dependency) ────────────
function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .trim();
}

/** Read a <meta property|name="key" content="..."> tag in either attr order. */
function metaContent(html: string, key: string): string | null {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]*content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${escaped}["']`, "i"),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m) return decodeEntities(m[1]);
  }
  return null;
}

function cleanAmazonTitle(title: string): string {
  return title
    .replace(/^Amazon\.[a-z.]+\s*:\s*/i, "")
    .replace(/\s*:\s*(Beauty|Health|Everything Else|Clothing.*|Home.*)\s*$/i, "")
    .trim();
}

/** Extract a price from ld+json offers or Amazon's on-page markup. */
function extractPrice(html: string): number | null {
  // 1) OpenGraph product price
  const og = metaContent(html, "og:price:amount") || metaContent(html, "product:price:amount");
  if (og && !Number.isNaN(Number(og))) return Number(og);

  // 2) ld+json offers.price (schema.org Product)
  for (const block of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const json = JSON.parse(block[1].trim());
      const nodes = Array.isArray(json) ? json : [json];
      for (const node of nodes) {
        const offers = node?.offers;
        const price = Array.isArray(offers) ? offers[0]?.price : offers?.price;
        if (price != null && !Number.isNaN(Number(price))) return Number(price);
      }
    } catch {
      /* not valid JSON — skip */
    }
  }

  // 3) Amazon on-page price markers
  const markers = [
    /"priceAmount"\s*:\s*([\d.]+)/i,
    /class="a-offscreen">\s*\$([\d,]+\.\d{2})/i,
    /id="priceblock_ourprice"[^>]*>\s*\$([\d,]+\.\d{2})/i,
  ];
  for (const re of markers) {
    const m = html.match(re);
    if (m) {
      const n = Number(m[1].replace(/,/g, ""));
      if (!Number.isNaN(n)) return n;
    }
  }
  return null;
}

async function fetchAndParse(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      cache: "no-store",
    });
    if (!res.ok) return { ok: false as const, status: res.status };
    const html = await res.text();

    const rawTitle =
      metaContent(html, "og:title") ||
      (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
    const title = rawTitle ? cleanAmazonTitle(decodeEntities(rawTitle)) : null;
    const imageUrl = metaContent(html, "og:image");
    const description =
      metaContent(html, "og:description") || metaContent(html, "description");
    const price = extractPrice(html);

    return { ok: true as const, title, imageUrl, description, price };
  } catch {
    return { ok: false as const, status: 0 };
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(req: NextRequest) {
  // 1) Auth — admin only.
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2) Rate limit.
  if (rateLimited(clientIp(req))) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429 }
    );
  }

  // 3) Validate input.
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const url = (body.url ?? "").trim();
  if (!url || !/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: "Provide a valid http(s) URL." }, { status: 400 });
  }

  // 4) ASIN.
  const asin = extractAsin(url);
  if (!asin) {
    return NextResponse.json(
      { error: "Could not find an ASIN in that URL. Make sure it's an Amazon product link." },
      { status: 422 }
    );
  }

  // 5) Scrape (best-effort — Amazon may serve a bot page; fields stay editable).
  const parsed = await fetchAndParse(url);

  return NextResponse.json({
    asin,
    affiliateUrl: url, // SiteStripe links are already affiliate-tagged
    title: parsed.ok ? parsed.title : null,
    imageUrl: parsed.ok ? parsed.imageUrl : null,
    description: parsed.ok ? parsed.description : null,
    price: parsed.ok ? parsed.price : null,
    warning: parsed.ok
      ? undefined
      : "Couldn't auto-read the product page — fill the fields in manually.",
  });
}
