import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import ProductCard from "@/components/ProductCard";
import { CATEGORIES, POPULAR_SEARCHES } from "@/lib/data";
import { getTrendingProducts } from "@/lib/db";

export const revalidate = 3600;

export default async function HomePage() {
  const trending = await getTrendingProducts();

  return (
    <>
      {/* ── HERO ── */}
      <section style={{ background: "var(--background-alt)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ paddingTop: "5.5rem", paddingBottom: "5.5rem" }}>
          <p className="eyebrow fade-up" style={{ marginBottom: 18 }}>AI Dupe Discovery · Beauty · Hair · Jewelry</p>
          <h1 className="fade-up fade-up-delay-1" style={{ fontSize: "clamp(2.4rem, 6vw, 4.25rem)", fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: "1.1rem" }}>
            Smell, look &amp; glow expensive — <span className="shimmer-text">for less.</span>
          </h1>
          <p className="fade-up fade-up-delay-2" style={{ fontSize: "1.08rem", color: "var(--muted)", maxWidth: 560, margin: "0 auto 2.25rem", lineHeight: 1.6 }}>
            Search any luxury or viral product. We find the best affordable dupes — ranked by match score, with the reasoning behind every pick.
          </p>
          <div className="fade-up fade-up-delay-3 max-w-2xl mx-auto mb-6">
            <SearchBar large />
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {POPULAR_SEARCHES.slice(0, 6).map((s) => (
              <Link key={s} href={`/search?q=${encodeURIComponent(s)}`} className="no-underline"
                style={{ padding: "6px 13px", fontSize: "0.76rem", color: "var(--foreground)", background: "#fff", border: "1px solid var(--border-strong)", borderRadius: 999 }}>
                {s}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ paddingTop: "4rem", paddingBottom: "1rem" }}>
        <div className="flex items-end justify-between mb-7">
          <h2 style={{ fontSize: "1.6rem", fontWeight: 600 }}>Shop by category</h2>
          <Link href="/search" className="no-underline uline" style={{ fontSize: "0.82rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--foreground)" }}>View all</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CATEGORIES.map((cat) => (
            <Link key={cat.slug} href={`/category/${cat.slug}`} className="no-underline group">
              <div className="product-card p-7" style={{ background: "#fff", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: "2rem", marginBottom: 14 }}>{cat.icon}</div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: 6 }}>{cat.label}</h3>
                <p style={{ fontSize: "0.88rem", color: "var(--muted)", marginBottom: 16, lineHeight: 1.55 }}>{cat.description}</p>
                <span className="uline" style={{ fontSize: "0.8rem", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>Explore {cat.label} →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── TRENDING ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ paddingTop: "3.5rem" }}>
        <div className="flex items-end justify-between mb-7">
          <h2 style={{ fontSize: "1.6rem", fontWeight: 600 }}>Trending dupes</h2>
          <Link href="/search" className="no-underline uline" style={{ fontSize: "0.82rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--foreground)" }}>See more</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {trending.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: "var(--background-dark)", marginTop: "4rem" }} className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center" style={{ fontSize: "1.6rem", fontWeight: 600, color: "#fff", marginBottom: 40 }}>How DupeDose works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { n: "01", t: "Search anything", b: "A luxury product, a viral item, a brand, an ingredient, or a look." },
              { n: "02", t: "We find real dupes", b: "Our engine surfaces genuine alternatives, each scored with the reasoning why." },
              { n: "03", t: "Compare & shop", b: "See prices side by side and buy at Amazon, Sephora, Ulta and more." },
            ].map(({ n, t, b }) => (
              <div key={n}>
                <p style={{ fontSize: "0.8rem", letterSpacing: "0.1em", color: "rgba(255,255,255,0.45)", marginBottom: 10 }}>{n}</p>
                <h3 style={{ fontSize: "1.12rem", fontWeight: 600, color: "#fff", marginBottom: 8 }}>{t}</h3>
                <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUIZ BANNER ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-10 md:p-12" style={{ border: "1px solid var(--border-strong)" }}>
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: 8 }}>Get your free beauty profile</h2>
            <p style={{ color: "var(--muted)", fontSize: "0.95rem", maxWidth: 440, lineHeight: 1.6 }}>
              Answer 5 quick questions — we&apos;ll build a personalized routine with exact product picks.
            </p>
          </div>
          <Link href="/quiz" className="no-underline btn-primary text-center" style={{ padding: "14px 30px", fontSize: "0.85rem", letterSpacing: "0.06em", textTransform: "uppercase", minWidth: 180 }}>
            Take the Quiz
          </Link>
        </div>
      </section>

      {/* ── SEO GUIDES ── */}
      <section style={{ background: "var(--background-alt)", borderTop: "1px solid var(--border)" }} className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center" style={{ fontSize: "1.4rem", fontWeight: 600, marginBottom: 32 }}>Popular dupe guides</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              ["Best Olaplex Dupes", "/search?q=olaplex"],
              ["Luxury Makeup Dupes", "/search?q=luxury+makeup"],
              ["Cartier Alternatives", "/search?q=cartier"],
              ["Dupes Under $50", "/search?q=under+50"],
              ["Clean Moisturizers", "/search?q=moisturizer"],
              ["Perfume Dupes", "/search?q=perfume"],
              ["Jewelry Under $200", "/search?q=jewelry"],
              ["Viral TikTok Dupes", "/search?q=viral"],
            ].map(([label, href]) => (
              <Link key={label as string} href={href as string} className="no-underline"
                style={{ padding: "14px 16px", background: "#fff", border: "1px solid var(--border)", color: "var(--foreground)", fontSize: "0.85rem", fontWeight: 500 }}>
                {label} →
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
