import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import SearchBar from "@/components/SearchBar";
import { CATEGORIES } from "@/lib/data";
import { getProductsByCollection } from "@/lib/db";
import { absoluteUrl } from "@/lib/site";
import Link from "next/link";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const cat = CATEGORIES.find((c) => c.slug === slug);
  if (!cat) return { title: "Category not found" };
  const title = `${cat.label} Dupes & Affordable Alternatives`;
  const description = `Discover the best ${cat.label.toLowerCase()} dupes and affordable alternatives — ${cat.description}. Ranked by match score with the reasoning behind each pick.`;
  return {
    title,
    description,
    alternates: { canonical: `/category/${cat.slug}` },
    openGraph: { title, description, url: absoluteUrl(`/category/${cat.slug}`), type: "website" },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const cat = CATEGORIES.find((c) => c.slug === slug);
  if (!cat) notFound();

  const products = await getProductsByCollection(cat.cats, cat.subs);
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${cat.label} dupes & alternatives`,
    numberOfItems: products.length,
    itemListElement: products.slice(0, 30).map((p, i) => ({
      "@type": "ListItem", position: i + 1, name: `${p.brandName} ${p.name}`, url: absoluteUrl(`/product/${p.slug}`),
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      {/* Hero banner */}
      <div style={{ background: "var(--background-alt)", borderBottom: "1px solid var(--border)" }} className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="eyebrow" style={{ marginBottom: 10 }}>{cat.description}</p>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
            {cat.label} Dupes
          </h1>
          <p style={{ color: "var(--muted)", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
            {products.length} products, alternatives &amp; dupes
          </p>
          <div className="max-w-xl">
            <SearchBar placeholder={`Search ${cat.label.toLowerCase()} products...`} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Subcategory pills */}
        <div className="flex flex-wrap gap-2 mb-10">
          <span className="px-4 py-2 text-sm font-semibold" style={{ background: "var(--foreground)", color: "#fff", borderRadius: 999 }}>All</span>
          {cat.subcategories.map((sub) => (
            <Link key={sub} href={`/search?q=${encodeURIComponent(sub)}`} className="no-underline px-4 py-2 text-sm font-medium transition-all"
              style={{ background: "#fff", color: "var(--foreground)", border: "1px solid var(--border-strong)", borderRadius: 999 }}>
              {sub}
            </Link>
          ))}
        </div>

        {/* Product grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 style={{ fontSize: "1.35rem", fontWeight: 600 }}>More {cat.label} coming soon</h3>
          </div>
        )}

        {/* SEO links */}
        <div className="mt-16 pt-10" style={{ borderTop: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "1rem" }}>
            Popular {cat.label} Guides
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {cat.subcategories.map((sub) => (
              <Link key={sub} href={`/search?q=best+${sub.toLowerCase()}+alternatives`}
                className="no-underline p-3 text-sm font-medium"
                style={{ background: "#fff", color: "var(--foreground)", border: "1px solid var(--border)" }}>
                Best {sub} Alternatives →
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
