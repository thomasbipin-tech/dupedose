// ────────────────────────────────────────────────────────────
// Admin shell. Second defence layer (after middleware): re-verifies the
// admin server-side on every render, so no admin page can leak even if
// the matcher is ever misconfigured. Also mounts the toast host.
// ────────────────────────────────────────────────────────────

import { redirect } from "next/navigation";
import Link from "next/link";
import { Toaster } from "sonner";
import { getAdminUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminUser();
  if (!admin) redirect("/login?next=/admin/add-product");

  return (
    <div style={{ background: "var(--background-alt)", minHeight: "calc(100vh - 64px)" }}>
      <div
        style={{
          background: "var(--background-dark)",
          color: "#fff",
          borderBottom: "1px solid #000",
        }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex items-center justify-between" style={{ height: 52 }}>
          <div className="flex items-center gap-6">
            <span
              className="eyebrow"
              style={{ color: "#fff", letterSpacing: "0.2em" }}
            >
              Admin
            </span>
            <Link
              href="/admin/add-product"
              className="no-underline"
              style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.8rem", letterSpacing: "0.04em" }}
            >
              Add product
            </Link>
          </div>
          <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.78rem" }}>{admin.email}</span>
        </div>
      </div>
      {children}
      <Toaster position="top-center" richColors closeButton />
    </div>
  );
}
