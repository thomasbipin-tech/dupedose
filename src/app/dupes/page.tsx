import type { Metadata } from "next";
import Link from "next/link";
import { getGuideBrands } from "@/lib/db";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Dupe Guides — Best Affordable Alternatives by Brand",
  description: "Browse DupeDose guides to the best dupes and affordable alternatives for top skincare, makeup, fragrance, and hair care brands.",
  alternates: { canonical: "/dupes" },
};

export default async function DupesIndexPage() {
  const brands = (await getGuideBrands()).filter((b) => b.count > 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "DupeDose dupe guides by brand",
    itemListElement: brands.slice(0, 100).map((b, i) => ({
      "@type": "ListItem", position: i + 1, name: `Best ${b.name} Dupes`, url: absoluteUrl(`/dupes/${b.id}`),
    })),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <p className="eyebrow mb-2">Guides</p>
      <h1 style={{ fontSize: "clamp(2rem,5vw,2.75rem)", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>
        Dupe guides by brand
      </h1>
      <p style={{ color: "var(--muted)", fontSize: "1.02rem", maxWidth: 620, lineHeight: 1.6, marginBottom: "2.5rem" }}>
        Find the best affordable alternatives to the brands you love — each ranked by match score with the reasoning behind every pick.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {brands.map((b) => (
          <Link key={b.id} href={`/dupes/${b.id}`} className="no-underline product-card p-5"
            style={{ background: "#fff", border: "1px solid var(--border)" }}>
            <p style={{ fontWeight: 600, fontSize: "0.98rem", marginBottom: 2 }}>Best {b.name} Dupes</p>
            <p style={{ color: "var(--muted)", fontSize: "0.8rem" }}>{b.count} {b.count === 1 ? "product" : "products"} →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
