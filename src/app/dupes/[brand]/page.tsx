import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getBrandBySlug, getProductsByBrand, getProductAlternatives } from "@/lib/db";
import { CATEGORIES } from "@/lib/data";
import { absoluteUrl } from "@/lib/site";

interface GuidePageProps {
  params: Promise<{ brand: string }>;
}

export const revalidate = 3600;
export const dynamicParams = true;
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { brand } = await params;
  const b = await getBrandBySlug(brand);
  if (!b) return { title: "Dupes guide not found" };
  const title = `Best ${b.name} Dupes & Affordable Alternatives (2026)`;
  const description = `Looking for ${b.name} dupes? We compare ${b.name} products with affordable alternatives — ranked by match score, with the reasoning and price for each pick.`;
  return {
    title,
    description,
    alternates: { canonical: `/dupes/${b.id}` },
    openGraph: { title, description, url: absoluteUrl(`/dupes/${b.id}`), type: "article" },
  };
}

export default async function BrandGuidePage({ params }: GuidePageProps) {
  const { brand } = await params;
  const b = await getBrandBySlug(brand);
  if (!b) notFound();

  const products = await getProductsByBrand(b.id);
  if (!products.length) notFound();
  const cat = CATEGORIES.find((c) => c.slug === b.category);

  // Build clusters: each notable product + its top alternatives.
  const anchors = products.slice(0, 8);
  const clusters = await Promise.all(
    anchors.map(async (p) => ({ product: p, alts: (await getProductAlternatives(p.id)).slice(0, 4) }))
  );
  const withAlts = clusters.filter((c) => c.alts.length > 0);

  const faqs = [
    {
      q: `What are the best ${b.name} dupes?`,
      a: `The closest ${b.name} alternatives on DupeDose include ${withAlts.slice(0, 3).flatMap((c) => c.alts.slice(0, 1).map((a) => `${a.brandName} ${a.name}`)).join(", ") || "a range of affordable picks"} — each chosen for a similar formula, finish, or effect at a lower price.`,
    },
    {
      q: `Are there cheaper alternatives to ${b.name}?`,
      a: `Yes. For most ${b.name} ${cat?.label.toLowerCase() ?? "products"}, there are budget-friendly alternatives that deliver comparable results. DupeDose ranks them by how closely they match the original.`,
    },
    {
      q: `How does DupeDose choose ${b.name} dupes?`,
      a: `We compare products by their key ingredients/attributes, finish, performance, and price, then rank alternatives by a match score and explain the reasoning behind each one.`,
    },
  ];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Dupe Guides", item: absoluteUrl("/dupes") },
        { "@type": "ListItem", position: 3, name: `${b.name} Dupes`, item: absoluteUrl(`/dupes/${b.id}`) },
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="flex items-center gap-2 text-sm mb-6" style={{ color: "var(--muted)" }}>
        <Link href="/" className="no-underline uline" style={{ color: "var(--muted)" }}>Home</Link><span>›</span>
        <Link href="/dupes" className="no-underline uline" style={{ color: "var(--muted)" }}>Dupe Guides</Link><span>›</span>
        <span style={{ color: "var(--foreground)" }}>{b.name}</span>
      </nav>

      <p className="eyebrow mb-2">{cat?.label} Dupe Guide</p>
      <h1 style={{ fontSize: "clamp(2rem,5vw,2.75rem)", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>
        Best {b.name} Dupes &amp; Alternatives
      </h1>
      <p style={{ color: "var(--muted)", fontSize: "1.02rem", maxWidth: 680, lineHeight: 1.6, marginBottom: "2.5rem" }}>
        Love {b.name} but not the price? Below are the closest affordable alternatives we&apos;ve found — each ranked by how
        well it matches the original, with the reasoning and current price.
      </p>

      {withAlts.map(({ product, alts }) => (
        <section key={product.id} className="mb-14">
          <div className="flex items-end justify-between mb-5">
            <h2 style={{ fontSize: "1.4rem", fontWeight: 600 }}>
              Dupes for {product.brandName} {product.name}
            </h2>
            <Link href={`/product/${product.slug}`} className="no-underline uline" style={{ fontSize: "0.8rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--foreground)" }}>
              Full comparison
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {alts.map((a) => (
              <ProductCard key={a.id} product={a} matchScore={a.matchScore} dupeLevel={a.dupeLevel} reason={a.reason} />
            ))}
          </div>
        </section>
      ))}

      {/* FAQ */}
      <section className="mt-16 pt-10" style={{ borderTop: "1px solid var(--border)" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1.25rem" }}>Frequently asked questions</h2>
        <div className="flex flex-col gap-5 max-w-3xl">
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
