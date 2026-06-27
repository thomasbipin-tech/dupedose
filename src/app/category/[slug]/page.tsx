import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import SearchBar from "@/components/SearchBar";
import { CATEGORIES } from "@/lib/data";
import { getProductsByCategory } from "@/lib/db";
import { Category } from "@/lib/types";
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

  const products = await getProductsByCategory(slug as Category);
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
      <div style={{
        background: `linear-gradient(135deg, ${cat.color}22 0%, ${cat.bgColor} 100%)`,
        borderBottom: "1px solid var(--border)",
      }} className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-6xl mb-4" style={{ color: cat.color }}>{cat.icon}</div>
          <h1 style={{ fontSize: "2.5rem", fontFamily: "Georgia, serif", fontWeight: 700, marginBottom: "0.75rem" }}>
            {cat.label}
          </h1>
          <p style={{ color: "var(--muted)", fontFamily: "system-ui, sans-serif", marginBottom: "1.5rem" }}>
            {cat.description} — {products.length} products, alternatives, and dupes
          </p>
          <div className="max-w-xl">
            <SearchBar placeholder={`Search ${cat.label.toLowerCase()} products...`} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Subcategory pills */}
        <div className="flex flex-wrap gap-2 mb-10">
          <span className="px-4 py-2 rounded-full text-sm font-semibold" style={{ background: cat.color, color: "#fff", fontFamily: "system-ui, sans-serif" }}>All</span>
          {cat.subcategories.map((sub) => (
            <button key={sub} className="px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={{ background: cat.bgColor, color: cat.color, border: `1px solid ${cat.color}30`, fontFamily: "system-ui, sans-serif", cursor: "pointer" }}>
              {sub}
            </button>
          ))}
        </div>

        {/* Product grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-20">
            <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>{cat.icon}</p>
            <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.35rem" }}>More {cat.label} coming soon</h3>
          </div>
        )}

        {/* SEO links */}
        <div className="mt-16 pt-10" style={{ borderTop: "1px solid var(--border)" }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>
            Popular {cat.label} Guides
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {cat.subcategories.map((sub) => (
              <Link key={sub} href={`/search?q=best+${sub.toLowerCase()}+alternatives`}
                className="no-underline p-3 rounded-xl text-sm font-medium"
                style={{ background: cat.bgColor, color: cat.color, fontFamily: "system-ui, sans-serif" }}>
                Best {sub} Alternatives →
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
