import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/db";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const results = await searchProducts(q);
  return NextResponse.json({ query: q, count: results.length, results });
}
