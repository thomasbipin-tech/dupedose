import { notFound } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import ComparisonTable from "@/components/ComparisonTable";
import { CATEGORIES } from "@/lib/data";
import { getProductBySlug, getProductAlternatives, getProductOffers, getAllProductSlugs } from "@/lib/db";
import { formatPrice } from "@/lib/types";
import { productImage } from "@/lib/images";
import { AFFILIATE_DISCLOSURE } from "@/lib/affiliate";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  return getAllProductSlugs();
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {[1, 2, 3, 4, 5].map(i => (
          <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? "var(--gold)" : "#e5e7eb"}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      <span style={{ fontFamily: "system-ui, sans-serif", color: "var(--muted)", fontSize: "0.9rem" }}>
        {rating.toFixed(1)} · {count.toLocaleString()} reviews
      </span>
    </div>
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [alternatives, offers] = await Promise.all([
    getProductAlternatives(product.id),
    getProductOffers(product.id),
  ]);
  const cat = CATEGORIES.find((c) => c.slug === product.category);
  const comparisonProducts = [product, ...alternatives.slice(0, 2)];

  const BG_GRAD: Record<string, string> = {
    beauty: "linear-gradient(135deg, #f5dde3 0%, #e8c4cd 100%)",
    hair: "linear-gradient(135deg, #f5ead4 0%, #e8d4a4 100%)",
    jewelry: "linear-gradient(135deg, #ede9fe 0%, #d4c4f4 100%)",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-8" style={{ fontFamily: "system-ui, sans-serif", color: "var(--muted)" }}>
        <Link href="/" className="no-underline hover:underline" style={{ color: "var(--muted)" }}>Home</Link>
        <span>›</span>
        <Link href={`/category/${product.category}`} className="no-underline hover:underline" style={{ color: "var(--muted)" }}>
          {cat?.label ?? product.category}
        </Link>
        <span>›</span>
        <span style={{ color: "var(--foreground)" }}>{product.name}</span>
      </nav>

      {/* Product hero */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
        {/* Image */}
        <div className="rounded-3xl overflow-hidden" style={{ background: BG_GRAD[product.category] ?? BG_GRAD.beauty, minHeight: 360 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={productImage(product)} alt={`${product.brandName} ${product.name}`}
            className="w-full h-full" style={{ objectFit: "cover", minHeight: 360 }} />
        </div>

        {/* Info */}
        <div>
          <Link href={`/category/${product.category}`} className="no-underline">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3"
              style={{ background: cat?.bgColor, color: cat?.color, fontFamily: "system-ui, sans-serif" }}>
              {cat?.icon} {cat?.label}
            </span>
          </Link>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--rose)", fontFamily: "system-ui, sans-serif" }}>{product.brandName}</p>
          <h1 style={{ fontSize: "2rem", fontFamily: "Georgia, serif", fontWeight: 700, lineHeight: 1.15, marginBottom: "1rem" }}>
            {product.name}
          </h1>
          <StarRating rating={product.rating} count={product.reviewCount} />

          <div className="my-4 flex items-baseline gap-3">
            <span style={{ fontSize: "2rem", fontFamily: "Georgia, serif", fontWeight: 700 }}>{formatPrice(product.price)}</span>
          </div>

          <p style={{ color: "var(--muted)", fontFamily: "system-ui, sans-serif", lineHeight: 1.7, marginBottom: "1.25rem" }}>
            {product.description}
          </p>

          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--foreground)", fontFamily: "system-ui, sans-serif" }}>Best For</p>
          <p style={{ color: "var(--muted)", fontFamily: "system-ui, sans-serif", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            ✓ {product.targetUser}
          </p>

          {/* Key attributes */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {Object.entries(product.attributes).slice(0, 4).map(([k, v]) => (
                <span key={k} className="px-3 py-1 rounded-full text-xs"
                  style={{ background: "var(--rose-light)", color: "var(--rose-dark)", fontFamily: "system-ui, sans-serif" }}>
                  {k.replace(/([A-Z])/g, " $1").trim()}: {typeof v === "boolean" ? (v ? "Yes" : "No") : String(v)}
                </span>
              ))}
            </div>
          )}

          {/* Where to Buy — affiliate offers */}
          <div className="mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--foreground)", fontFamily: "system-ui, sans-serif" }}>
              Where to Buy
            </p>
            {offers.length > 0 ? (
              <div className="flex flex-col gap-2">
                {offers.map((offer) => (
                  <a key={offer.id} href={`/api/go/${offer.id}`} target="_blank" rel="sponsored nofollow noopener"
                    className="no-underline flex items-center justify-between px-5 py-3.5 rounded-2xl font-semibold transition-all"
                    style={{ background: "var(--rose)", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
                    <span>View Deal at {offer.retailerName}</span>
                    <span>{offer.price ? formatPrice(offer.price) : "Shop"} →</span>
                  </a>
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--muted)", fontFamily: "system-ui, sans-serif", fontSize: "0.875rem" }}>
                No retailer links yet — check back soon.
              </p>
            )}
            <p className="mt-2 text-xs" style={{ color: "var(--muted)", fontFamily: "system-ui, sans-serif" }}>
              {AFFILIATE_DISCLOSURE}
            </p>
          </div>

          <Link href={`/compare?a=${product.slug}`}
            className="no-underline inline-block px-5 py-3 rounded-2xl font-semibold"
            style={{ border: "2px solid var(--border)", color: "var(--foreground)", fontFamily: "system-ui, sans-serif" }}>
            Compare with alternatives
          </Link>
        </div>
      </div>

      {/* Alternatives */}
      {alternatives.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--rose)", fontFamily: "system-ui, sans-serif" }}>AI-Matched</p>
              <h2 style={{ fontSize: "1.5rem", fontFamily: "Georgia, serif", fontWeight: 700 }}>
                Best alternatives to {product.name}
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {alternatives.map((alt) => (
              <ProductCard key={alt.id} product={alt} matchScore={alt.matchScore} dupeLevel={alt.dupeLevel} reason={alt.reason} />
            ))}
          </div>
        </section>
      )}

      {/* Ingredients */}
      {product.ingredients && product.ingredients.length > 0 && (
        <section className="mb-16 p-8 rounded-2xl" style={{ background: "#fff", border: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "1.25rem", fontFamily: "Georgia, serif", fontWeight: 700, marginBottom: "1rem" }}>Key Ingredients</h2>
          <div className="flex flex-wrap gap-2">
            {product.ingredients.map((ing) => (
              <span key={ing} className="px-3 py-1.5 rounded-full text-sm"
                style={{ background: "var(--gold-light)", color: "var(--gold-dark)", fontFamily: "system-ui, sans-serif" }}>
                {ing}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Comparison table */}
      {comparisonProducts.length >= 2 && (
        <section className="mb-16">
          <h2 style={{ fontSize: "1.5rem", fontFamily: "Georgia, serif", fontWeight: 700, marginBottom: "1.25rem" }}>
            Side-by-Side Comparison
          </h2>
          <ComparisonTable products={comparisonProducts} />
        </section>
      )}
    </div>
  );
}
