import SearchBar from "@/components/SearchBar";
import ProductCard from "@/components/ProductCard";
import { POPULAR_SEARCHES } from "@/lib/data";
import { searchProducts, getAllProducts } from "@/lib/db";
import Link from "next/link";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q ?? "";
  const results = query ? await searchProducts(query) : await getAllProducts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <p className="eyebrow mb-1">Search</p>
        <h1 style={{ fontSize: "2rem", fontWeight: 600, marginBottom: "1rem", letterSpacing: "-0.01em" }}>
          {query ? `Results for "${query}"` : "Discover dupes"}
        </h1>
        <div className="max-w-2xl">
          <SearchBar defaultValue={query} />
        </div>
      </div>

      {/* Popular searches */}
      {!query && (
        <div className="mb-10">
          <p className="text-sm font-medium mb-3" style={{ color: "var(--muted)", fontFamily: "system-ui, sans-serif" }}>Popular searches</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SEARCHES.map((s) => (
              <Link key={s} href={`/search?q=${encodeURIComponent(s)}`}
                className="no-underline px-3 py-1.5 text-sm transition-all"
                style={{ background: "#fff", color: "var(--foreground)", border: "1px solid var(--border-strong)", borderRadius: 999 }}>
                {s}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between mb-6">
        <p style={{ color: "var(--muted)", fontFamily: "system-ui, sans-serif", fontSize: "0.9rem" }}>
          {results.length} {results.length === 1 ? "result" : "results"}
          {query ? ` matching "${query}"` : ""}
        </p>
      </div>

      {/* Results grid */}
      {results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>✦</p>
          <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.35rem", marginBottom: "0.5rem" }}>No results found</h3>
          <p style={{ color: "var(--muted)", fontFamily: "system-ui, sans-serif", marginBottom: "1.5rem" }}>
            Try a brand name (Olaplex, Dior, Rhode) or a product type (serum, blush, lip balm).
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[["Skincare", "/category/skincare"], ["Makeup", "/category/makeup"], ["Fragrance", "/category/fragrance"], ["Hair Care", "/category/hair"], ["Dupe Guides", "/dupes"]].map(([l, h]) => (
              <Link key={h} href={h} className="no-underline px-4 py-2 text-sm font-medium"
                style={{ background: "#fff", color: "var(--foreground)", border: "1px solid var(--border-strong)", borderRadius: 999 }}>
                {l}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
