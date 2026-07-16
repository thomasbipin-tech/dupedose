// ────────────────────────────────────────────────────────────
// POST /api/admin/products
// Admin-only. Inserts a new product + its Amazon affiliate offer, and
// (optionally) a dupe relationship — using the SERVICE-ROLE client so it
// bypasses RLS. Every write is admin-gated server-side before it runs.
// ────────────────────────────────────────────────────────────

import { NextResponse, type NextRequest } from "next/server";
import { getAdminUser } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_DUPE_LEVELS = ["premium", "similar", "budget"] as const;
type DupeLevel = (typeof VALID_DUPE_LEVELS)[number];

interface DupePayload {
  originalId: string;
  matchScore: number;
  dupeLevel: DupeLevel;
  reason?: string;
}

interface ProductPayload {
  name?: string;
  brand?: string;
  category?: string;
  imageUrl?: string;
  price?: number | string | null;
  description?: string;
  asin?: string;
  affiliateUrl?: string;
  rawUrl?: string;
  dupe?: DupePayload | null;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function toNumberOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function POST(req: NextRequest) {
  // 1) Auth — admin only.
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = supabaseAdmin();
  if (!db) {
    return NextResponse.json(
      { error: "Server misconfigured: SUPABASE_SERVICE_ROLE_KEY is missing." },
      { status: 500 }
    );
  }

  // 2) Parse + validate.
  let body: ProductPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const brand = (body.brand ?? "").trim();
  const category = (body.category ?? "").trim();
  const imageUrl = (body.imageUrl ?? "").trim();
  const description = (body.description ?? "").trim();
  const asin = (body.asin ?? "").trim().toUpperCase();
  const rawUrl = (body.rawUrl ?? body.affiliateUrl ?? "").trim();
  const price = toNumberOrNull(body.price);

  if (!name) return NextResponse.json({ error: "Product name is required." }, { status: 400 });
  if (!imageUrl) return NextResponse.json({ error: "Image URL is required." }, { status: 400 });
  if (!category) return NextResponse.json({ error: "Category is required." }, { status: 400 });
  if (!rawUrl) return NextResponse.json({ error: "Affiliate URL is required." }, { status: 400 });

  // Category must be a real categories.slug (products.category has a FK).
  const { data: cat } = await db.from("categories").select("slug").eq("slug", category).maybeSingle();
  if (!cat) {
    return NextResponse.json({ error: `Unknown category "${category}".` }, { status: 400 });
  }

  // 3) Product id + unique slug.
  const productId = asin ? `amzn-${asin}` : `admin-${slugify(name)}`;

  // Reject a duplicate ASIN up-front with a friendly message.
  const { data: existing } = await db.from("products").select("id,slug").eq("id", productId).maybeSingle();
  if (existing) {
    return NextResponse.json(
      { error: "That product already exists.", slug: existing.slug },
      { status: 409 }
    );
  }

  let slug = slugify(`${brand} ${name}`) || slugify(name) || productId;
  const { data: slugTaken } = await db.from("products").select("id").eq("slug", slug).maybeSingle();
  if (slugTaken) {
    const suffix = asin ? asin.slice(-6).toLowerCase() : Date.now().toString(36).slice(-6);
    slug = `${slug}-${suffix}`.slice(0, 96);
  }

  // 4) Insert the product.
  const { error: productErr } = await db.from("products").insert({
    id: productId,
    brand_id: null, // free-text brand; no brands-table FK for admin adds
    brand_name: brand || "Unbranded",
    name,
    category,
    subcategory: null,
    price,
    image: imageUrl,
    rating: 0,
    review_count: 0,
    description: description || null,
    target_user: null,
    is_original: false,
    slug,
  });
  if (productErr) {
    return NextResponse.json(
      { error: `Failed to save product: ${productErr.message}` },
      { status: 500 }
    );
  }

  // 5) Ensure an Amazon retailer exists, then insert the offer.
  let { data: retailer } = await db
    .from("retailers")
    .select("id")
    .eq("network", "amazon")
    .limit(1)
    .maybeSingle();
  if (!retailer) {
    const { data: created, error: retErr } = await db
      .from("retailers")
      .upsert({ id: "amazon", name: "Amazon", homepage: "https://www.amazon.com", network: "amazon" })
      .select("id")
      .single();
    if (retErr) {
      await db.from("products").delete().eq("id", productId); // compensate
      return NextResponse.json(
        { error: `Failed to resolve Amazon retailer: ${retErr.message}` },
        { status: 500 }
      );
    }
    retailer = created;
  }
  if (!retailer) {
    await cleanup(db, productId);
    return NextResponse.json({ error: "No Amazon retailer configured." }, { status: 500 });
  }

  const { error: offerErr } = await db.from("product_offers").insert({
    product_id: productId,
    retailer_id: retailer.id,
    raw_url: rawUrl,
    affiliate_url: rawUrl, // SiteStripe URL is already affiliate-formatted
    price,
    currency: "USD",
    in_stock: true,
    source: "admin",
  });
  if (offerErr) {
    await db.from("products").delete().eq("id", productId); // compensate
    return NextResponse.json(
      { error: `Failed to save affiliate offer: ${offerErr.message}` },
      { status: 500 }
    );
  }

  // 6) Optional dupe relationship.
  const dupe = body.dupe;
  if (dupe && dupe.originalId) {
    const score = toNumberOrNull(dupe.matchScore);
    if (score === null || score < 0 || score > 100) {
      await cleanup(db, productId);
      return NextResponse.json({ error: "Match score must be between 0 and 100." }, { status: 400 });
    }
    if (!VALID_DUPE_LEVELS.includes(dupe.dupeLevel)) {
      await cleanup(db, productId);
      return NextResponse.json({ error: "Invalid dupe level." }, { status: 400 });
    }
    if (dupe.originalId === productId) {
      await cleanup(db, productId);
      return NextResponse.json({ error: "A product can't be a dupe of itself." }, { status: 400 });
    }

    const { error: dupeErr } = await db.from("dupe_relationships").insert({
      original_id: dupe.originalId,
      dupe_id: productId,
      match_score: Math.round(score),
      dupe_level: dupe.dupeLevel,
      reason: (dupe.reason ?? "").trim() || null,
      engine_version: "manual-admin",
    });
    if (dupeErr) {
      await cleanup(db, productId);
      return NextResponse.json(
        { error: `Failed to save dupe relationship: ${dupeErr.message}` },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ ok: true, id: productId, slug });
}

// Roll back a partially-inserted product (offer rows cascade on delete).
async function cleanup(
  db: NonNullable<ReturnType<typeof supabaseAdmin>>,
  productId: string
) {
  await db.from("products").delete().eq("id", productId);
}
