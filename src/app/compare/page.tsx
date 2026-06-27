"use client";
import { useState, useEffect } from "react";
import ComparisonTable from "@/components/ComparisonTable";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/lib/types";

/** Debounced product search against the /api/search route. */
function useProductSearch(query: string, skip: boolean) {
  const [results, setResults] = useState<Product[]>([]);
  useEffect(() => {
    if (skip || !query.trim()) {
      setResults([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: ctrl.signal });
        const data = await res.json();
        setResults((data.results ?? []).slice(0, 5));
      } catch {
        /* aborted or failed — ignore */
      }
    }, 200);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query, skip]);
  return results;
}

export default function ComparePage() {
  const [search1, setSearch1] = useState("");
  const [search2, setSearch2] = useState("");
  const [product1, setProduct1] = useState<Product | null>(null);
  const [product2, setProduct2] = useState<Product | null>(null);

  const sug1 = useProductSearch(search1, Boolean(product1));
  const sug2 = useProductSearch(search2, Boolean(product2));
  const comparisonProducts = [product1, product2].filter(Boolean) as Product[];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--rose)", fontFamily: "system-ui, sans-serif" }}>Compare</p>
      <h1 style={{ fontSize: "2rem", fontFamily: "Georgia, serif", fontWeight: 700, marginBottom: "0.5rem" }}>
        Compare Any Two Products
      </h1>
      <p style={{ color: "var(--muted)", fontFamily: "system-ui, sans-serif", marginBottom: "2.5rem" }}>
        Search for any two products to see a side-by-side ingredient, rating, and performance comparison.
      </p>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {[
          { label: "Product A", search: search1, setSearch: setSearch1, product: product1, setProduct: setProduct1, sug: sug1 },
          { label: "Product B", search: search2, setSearch: setSearch2, product: product2, setProduct: setProduct2, sug: sug2 },
        ].map(({ label, search, setSearch, product, setProduct, sug }) => (
          <div key={label}>
            <p className="text-sm font-semibold mb-2" style={{ fontFamily: "system-ui, sans-serif" }}>{label}</p>
            <div className="relative">
              <input
                type="text"
                value={product ? `${product.brandName} ${product.name}` : search}
                onChange={e => { setSearch(e.target.value); setProduct(null); }}
                placeholder="Search brand or product..."
                className="w-full outline-none rounded-2xl px-4 py-3"
                style={{ border: "2px solid var(--border)", fontFamily: "system-ui, sans-serif", fontSize: "0.95rem", background: "#fff" }}
              />
              {product && (
                <button
                  onClick={() => { setSearch(""); setProduct(null); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                  style={{ color: "var(--muted)", background: "none", border: "none", cursor: "pointer" }}>
                  ✕
                </button>
              )}
              {sug.length > 0 && !product && (
                <div className="absolute z-20 w-full mt-1 rounded-xl shadow-lg overflow-hidden"
                  style={{ background: "#fff", border: "1px solid var(--border)" }}>
                  {sug.map((p) => (
                    <button key={p.id}
                      onClick={() => { setProduct(p); setSearch(""); }}
                      className="w-full text-left px-4 py-3 transition-colors"
                      style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "system-ui, sans-serif", fontSize: "0.9rem", borderBottom: "1px solid var(--border)" }}>
                      <span style={{ color: "var(--rose)", fontSize: "0.75rem" }}>{p.brandName}</span>
                      <br />
                      {p.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {product && (
              <div className="mt-3">
                <ProductCard product={product} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Comparison table */}
      {comparisonProducts.length === 2 ? (
        <ComparisonTable products={comparisonProducts} />
      ) : (
        <div className="text-center py-16 rounded-2xl" style={{ border: "2px dashed var(--border)" }}>
          <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>◈</p>
          <p style={{ fontFamily: "Georgia, serif", fontSize: "1.15rem", color: "var(--muted)" }}>
            Select two products above to compare them side-by-side
          </p>
        </div>
      )}
    </div>
  );
}
