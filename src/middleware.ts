// ────────────────────────────────────────────────────────────
// Edge gate for /admin/*. Verifies the Supabase session on every admin
// request and redirects non-admins to /login. This is the first of two
// defence layers — each admin Server Component / Route Handler ALSO
// re-checks server-side (see src/lib/supabase/server.ts#getAdminUser).
// ────────────────────────────────────────────────────────────

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isAdminEmail } from "@/lib/auth/isAdmin";

export async function middleware(request: NextRequest) {
  // Carry cookie mutations (session refresh) through onto the response.
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  // IMPORTANT: getUser() validates the JWT against Supabase (not just the
  // cookie), and must run so the session cookie is refreshed.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    if (user) loginUrl.searchParams.set("denied", "1");
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
