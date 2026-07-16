import type { Metadata } from "next";
import { getCategories } from "@/lib/db";
import AddProductForm from "./AddProductForm";

export const metadata: Metadata = {
  title: "Add product",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AddProductPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6" style={{ paddingTop: "2.5rem", paddingBottom: "5rem" }}>
      <header style={{ marginBottom: "2rem" }}>
        <p className="eyebrow" style={{ color: "var(--accent)", marginBottom: "0.5rem" }}>
          New product
        </p>
        <h1 className="font-serif" style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.01em" }}>
          Add an Amazon product
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.95rem", marginTop: "0.5rem" }}>
          Paste a SiteStripe affiliate link — we&apos;ll pull the details, then you review and save.
        </p>
      </header>

      <AddProductForm categories={categories} />
    </div>
  );
}
