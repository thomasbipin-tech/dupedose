import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import ComparisonTable from "@/components/ComparisonTable";
import { CATEGORIES } from "@/lib/data";
import { getProductBySlug, getProductAlternatives, getProductOffers } from "@/lib/db";
import { formatPrice } from "@/lib/types";
import { productImage } from "@/lib/images";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import { AFFILIATE_DISCLOSURE } from "@/lib/affiliate";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;
// Render product pages on-demand (ISR) instead of prerendering all ~340 at
// build time — keeps the Vercel build fast/reliable; pages cache on first hit.
export const dynamicParams = true;
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  const title = product.isOriginal
    ? `${product.brandName} ${product.name} — Dupes & Alternatives`
    : `${product.brandName} ${product.name} — Reviews, Price & Dupes`;
  const description = `${product.description} Find the best affordable dupes and alternatives to ${product.brandName} ${product.name}, ranked by match score with the reasoning behind each pick.`;
  const img = productImage(product);
  return {
    title,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: { title, description, type: "website", url: absoluteUrl(`/product/${product.slug}`), images: [img], siteName: SITE_NAME },
    twitter: { card: "summary_large_image", title, description, images: [img] },
  };
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

  // Structured data for Google rich results + AI answer engines.
  const lowestOffer = offers.reduce<number | null>((min, o) => (o.price != null && (min === null || o.price < min) ? o.price : min), null);
  const cheapest = alternatives.filter((a) => a.price < product.price).sort((a, b) => a.price - b.price)[0];
  const faqs = [
    {
      q: `What is a good dupe for ${product.brandName} ${product.name}?`,
      a: alternatives.length
        ? `${alternatives[0].brandName} ${alternatives[0].name} is our top-ranked alternative (${alternatives[0].matchScore}% match) — ${alternatives[0].reason}`
        : `We're still curating alternatives for ${product.brandName} ${product.name}.`,
    },
    {
      q: `Is there a cheaper alternative to ${product.brandName} ${product.name}?`,
      a: cheapest
        ? `Yes — ${cheapest.brandName} ${cheapest.name} offers a similar result for ${formatPrice(cheapest.price)} versus ${formatPrice(product.price)}.`
        : `${product.brandName} ${product.name} is already among the more affordable options in its category.`,
    },
    {
      q: `Where can I buy ${product.brandName} ${product.name}?`,
      a: offers.length
        ? `It's available at ${offers.map((o) => o.retailerName).slice(0, 3).join(", ")} — see the "Where to Buy" links above for current prices.`
        : `Check the retailer links above for current availability.`,
    },
  ];
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: `${product.brandName} ${product.name}`,
      image: absoluteUrl(productImage(product)),
      description: product.description,
      brand: { "@type": "Brand", name: product.brandName },
      category: cat?.label ?? product.category,
      ...(product.reviewCount > 0 && {
        aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount },
      }),
      ...(lowestOffer != null && {
        offers: { "@type": "AggregateOffer", lowPrice: lowestOffer, priceCurrency: "USD", offerCount: offers.length, availability: "https://schema.org/InStock" },
      }),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: cat?.label ?? product.category, item: absoluteUrl(`/category/${product.category}`) },
        { "@type": "ListItem", position: 3, name: product.name, item: absoluteUrl(`/product/${product.slug}`) },
      ],
    },
    ...(alternatives.length > 0 ? [{
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Dupes & alternatives to ${product.brandName} ${product.name}`,
      itemListElement: alternatives.map((alt, i) => ({
        "@type": "ListItem", position: i + 1, name: `${alt.brandName} ${alt.name}`, url: absoluteUrl(`/product/${alt.slug}`),
      })),
    }] : []),
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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
            <span className="eyebrow inline-block mb-3">{cat?.label}</span>
          </Link>
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--foreground)", letterSpacing: "0.03em" }}>{product.brandName}</p>
          <h1 style={{ fontSize: "2rem", fontWeight: 600, lineHeight: 1.15, marginBottom: "1rem", letterSpacing: "-0.01em" }}>
            {product.name}
          </h1>
          <StarRating rating={product.rating} count={product.reviewCount} />

          <div className="my-4 flex items-baseline gap-3">
            <span style={{ fontSize: "1.9rem", fontWeight: 600 }}>{formatPrice(product.price)}</span>
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
                <span key={k} className="px-3 py-1 text-xs"
                  style={{ background: "var(--background-alt)", color: "var(--foreground)", border: "1px solid var(--border)", borderRadius: 999 }}>
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
                    className="no-underline flex items-center justify-between px-5 py-3.5 btn-primary"
                    style={{ fontWeight: 600 }}>
                    <span>View Deal at {offer.retailerName}</span>
                    {/* Amazon's Operating Agreement restricts showing non-API prices — show a CTA instead. */}
                    <span>{offer.network === "amazon" ? "Check price" : offer.price ? formatPrice(offer.price) : "Shop"} →</span>
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
            className="no-underline inline-block px-5 py-3 btn-ghost" style={{ fontWeight: 600 }}>
            Compare with alternatives
          </Link>
        </div>
      </div>

      {/* Alternatives */}
      {alternatives.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="eyebrow mb-1">Ranked dupes</p>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 600 }}>
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
        <section className="mb-16 p-8" style={{ background: "#fff", border: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "1rem" }}>Key Ingredients</h2>
          <div className="flex flex-wrap gap-2">
            {product.ingredients.map((ing) => (
              <span key={ing} className="px-3 py-1.5 text-sm"
                style={{ background: "var(--background-alt)", color: "var(--foreground)", border: "1px solid var(--border)", borderRadius: 999 }}>
                {ing}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Comparison table */}
      {comparisonProducts.length >= 2 && (
        <section className="mb-16">
          <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1.25rem" }}>
            Side-by-Side Comparison
          </h2>
          <ComparisonTable products={comparisonProducts} currentSlug={product.slug} />
        </section>
      )}

      {/* FAQ */}
      <section className="mb-8">
        <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1.25rem" }}>Frequently asked questions</h2>
        <div className="flex flex-col gap-5" style={{ maxWidth: 760 }}>
          {faqs.map((f) => (
            <div key={f.q}>
              <h3 style={{ fontSize: "1.02rem", fontWeight: 600, marginBottom: 4 }}>{f.q}</h3>
              <p style={{ color: "var(--muted)", lineHeight: 1.6, fontSize: "0.95rem" }}>{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
