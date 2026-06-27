import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Scheduled price-refresh endpoint (Vercel Cron target). Guarded by
// CRON_SECRET. With no price-feed adapters wired yet, it stamps
// last_checked_at so the pipeline is observable end-to-end.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const sb = supabaseAdmin();
  if (!sb) {
    return NextResponse.json({ ok: false, reason: "supabase-not-configured" });
  }

  const { count } = await sb
    .from("product_offers")
    .update({ last_checked_at: new Date().toISOString() }, { count: "exact" })
    .neq("id", "00000000-0000-0000-0000-000000000000");

  return NextResponse.json({ ok: true, refreshed: count ?? 0 });
}
