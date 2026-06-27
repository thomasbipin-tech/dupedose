import { NextRequest, NextResponse } from "next/server";
import { getOffer } from "@/lib/db";
import { supabaseAdmin } from "@/lib/supabase";

// Affiliate click redirect: logs the click (when DB configured), then 302s
// to the retailer's affiliate URL. Keeps affiliate URLs out of static HTML.
export async function GET(req: NextRequest, { params }: { params: Promise<{ offerId: string }> }) {
  const { offerId } = await params;
  const offer = await getOffer(offerId);

  if (!offer) {
    return NextResponse.redirect(new URL("/", req.url), 302);
  }

  // Fire-and-forget click logging (only when a service-role client exists).
  const admin = supabaseAdmin();
  if (admin) {
    try {
      await admin.from("click_log").insert({
        offer_id: offer.id,
        product_id: offer.productId,
        retailer_id: offer.retailerId,
        referrer: req.headers.get("referer"),
        user_agent: req.headers.get("user-agent"),
      });
    } catch {
      // never block the redirect on a logging failure
    }
  }

  return NextResponse.redirect(offer.affiliateUrl, 302);
}
