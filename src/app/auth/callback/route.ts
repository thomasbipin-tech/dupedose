// ────────────────────────────────────────────────────────────
// Magic-link landing route. Supabase redirects here with a `?code=`
// after the user clicks the email link; we exchange it for a session
// (sets the auth cookies) and forward to the originally-requested page.
// ────────────────────────────────────────────────────────────

import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin/add-product";
  // Only ever redirect to a same-origin path (avoid open-redirect).
  const safeNext = next.startsWith("/") ? next : "/admin/add-product";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("Invalid or expired sign-in link.")}`
  );
}
