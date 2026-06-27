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
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--rose)", fontFamily: "system-ui, sans-serif" }}>
          DupeDose Search
        </p>
        <h1 style={{ fontSize: "2rem", fontFamily: "Georgia, serif", fontWeight: 700, marginBottom: "1rem" }}>
          {query ? `Results for "${query}"` : "Discover Products"}
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
                className="no-underline px-3 py-1.5 rounded-full text-sm transition-all"
                style={{ background: "var(--rose-light)", color: "var(--rose-dark)", fontFamily: "system-ui, sans-serif", border: "1px solid rgba(201,97,122,0.2)" }}>
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
          <p style={{ color: "var(--muted)", fontFamily: "system-ui, sans-serif" }}>
            Try a brand name, product type, or describe what you&apos;re looking for.
          </p>
        </div>
      )}
    </div>
  );
}
