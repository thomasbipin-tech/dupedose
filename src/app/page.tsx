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
      <section
        style={{
          background: "linear-gradient(160deg, #1a0a12 0%, #2c0e1e 50%, #1a1a2c 100%)",
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}>
        {/* Decorative orbs */}
        <div style={{ position: "absolute", top: "15%", left: "8%", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,97,122,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "20%", right: "5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "40%", right: "20%", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(91,33,182,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ position: "relative", zIndex: 1 }}>
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 fade-up"
            style={{ background: "rgba(201,97,122,0.15)", border: "1px solid rgba(201,97,122,0.3)" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--rose)", display: "inline-block" }} />
            <span style={{ color: "var(--rose-light)", fontSize: "0.8rem", fontFamily: "system-ui, sans-serif", letterSpacing: "0.05em" }}>
              AI-Powered Beauty Discovery
            </span>
          </div>

          <h1 className="fade-up fade-up-delay-1" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 700, color: "#fff", lineHeight: 1.1, marginBottom: "1.25rem", fontFamily: "Georgia, serif" }}>
            Find your perfect
            <br />
            <span className="shimmer-text">beauty match.</span>
          </h1>

          <p className="fade-up fade-up-delay-2" style={{ fontSize: "1.15rem", color: "rgba(255,255,255,0.6)", marginBottom: "2.5rem", fontFamily: "system-ui, sans-serif", maxWidth: 560, margin: "0 auto 2.5rem" }}>
            Tell us what luxury product, celebrity look, or ingredient you want — we&apos;ll find the best alternatives, dupes, and recommendations.
          </p>

          {/* Search */}
          <div className="fade-up fade-up-delay-3 max-w-2xl mx-auto mb-6">
            <SearchBar large />
          </div>

          {/* Popular searches */}
          <div className="flex flex-wrap gap-2 justify-center">
            {POPULAR_SEARCHES.map((s) => (
              <Link key={s} href={`/search?q=${encodeURIComponent(s)}`}
                className="no-underline px-3 py-1.5 rounded-full text-xs transition-all"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.55)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  fontFamily: "system-ui, sans-serif",
                }}>
                {s}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--rose)", fontFamily: "system-ui, sans-serif" }}>Explore</p>
            <h2 style={{ fontSize: "1.75rem", fontFamily: "Georgia, serif", fontWeight: 700 }}>Three categories. One engine.</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => (
            <Link key={cat.slug} href={`/category/${cat.slug}`} className="no-underline group">
              <div className="rounded-2xl p-8 transition-all product-card" style={{ background: cat.bgColor, border: `1px solid ${cat.color}22` }}>
                <div className="text-5xl mb-4" style={{ color: cat.color }}>{cat.icon}</div>
                <h3 style={{ fontSize: "1.35rem", fontFamily: "Georgia, serif", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.5rem" }}>{cat.label}</h3>
                <p style={{ fontSize: "0.9rem", color: "var(--muted)", fontFamily: "system-ui, sans-serif", marginBottom: "1.25rem" }}>{cat.description}</p>
                <div className="flex flex-wrap gap-2">
                  {cat.subcategories.slice(0, 4).map((sub) => (
                    <span key={sub} className="px-2.5 py-1 rounded-full text-xs" style={{ background: `${cat.color}18`, color: cat.color, fontFamily: "system-ui, sans-serif" }}>{sub}</span>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold" style={{ color: cat.color, fontFamily: "system-ui, sans-serif" }}>
                  Explore {cat.label} <span>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: "var(--hero-bg)" }} className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--gold)", fontFamily: "system-ui, sans-serif" }}>The DupeDose Method</p>
            <h2 style={{ fontSize: "1.75rem", fontFamily: "Georgia, serif", fontWeight: 700, color: "#fff" }}>From search to perfect match</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Search or Describe", body: "Enter a product name, brand, ingredient, celebrity, or describe your goal.", icon: "🔍" },
              { step: "02", title: "AI Understands Intent", body: "Our engine parses your query across 50,000+ products and attributes.", icon: "✦" },
              { step: "03", title: "See Ranked Matches", body: "Products ranked by match score — Premium, Similar, and Budget alternatives.", icon: "◈" },
              { step: "04", title: "Compare & Buy", body: "Side-by-side comparison, ingredient analysis, and affiliate links.", icon: "◇" },
            ].map(({ step, title, body, icon }) => (
              <div key={step} className="text-center p-6">
                <div className="text-3xl mb-3">{icon}</div>
                <p className="text-xs font-mono mb-2" style={{ color: "var(--gold)", opacity: 0.6 }}>{step}</p>
                <h3 className="font-semibold mb-2" style={{ color: "#fff", fontFamily: "Georgia, serif", fontSize: "1.05rem" }}>{title}</h3>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", fontFamily: "system-ui, sans-serif", lineHeight: 1.6 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRENDING PRODUCTS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--rose)", fontFamily: "system-ui, sans-serif" }}>Most Searched</p>
            <h2 style={{ fontSize: "1.75rem", fontFamily: "Georgia, serif", fontWeight: 700 }}>Trending right now</h2>
          </div>
          <Link href="/search" className="text-sm font-medium no-underline" style={{ color: "var(--rose)", fontFamily: "system-ui, sans-serif" }}>
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {trending.slice(0, 6).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* ── AI BANNER ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="rounded-3xl p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8"
          style={{ background: "linear-gradient(135deg, #2c0e1e 0%, #1a1a2c 100%)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--gold)", fontFamily: "system-ui, sans-serif" }}>Personalized Beauty AI</p>
            <h2 style={{ fontSize: "1.75rem", fontFamily: "Georgia, serif", fontWeight: 700, color: "#fff", marginBottom: "0.75rem" }}>
              Get your free beauty profile
            </h2>
            <p style={{ color: "rgba(255,255,255,0.55)", fontFamily: "system-ui, sans-serif", fontSize: "0.95rem", maxWidth: 420 }}>
              Answer 5 questions about your hair type, skin concerns, and budget. We&apos;ll build a personalized routine with exact product recommendations.
            </p>
          </div>
          <Link href="/quiz"
            className="no-underline px-8 py-4 rounded-2xl font-semibold text-center flex-shrink-0 transition-all active:scale-95"
            style={{ background: "var(--rose)", color: "#fff", fontFamily: "system-ui, sans-serif", fontSize: "1rem", minWidth: 180 }}>
            Take the Quiz →
          </Link>
        </div>
      </section>

      {/* ── SEO CONTENT BLOCKS ── */}
      <section style={{ background: "rgba(0,0,0,0.02)", borderTop: "1px solid var(--border)" }} className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center mb-10" style={{ fontSize: "1.5rem", fontFamily: "Georgia, serif", fontWeight: 700 }}>Popular Discovery Guides</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              ["Best Olaplex Alternatives", "/search?q=olaplex+alternatives"],
              ["Luxury Makeup Dupes", "/search?q=luxury+makeup+dupes"],
              ["Cartier Jewelry Alternatives", "/search?q=cartier+alternatives"],
              ["Best Products Under $50", "/search?q=best+products+under+50"],
              ["Clean Beauty Moisturizers", "/search?q=clean+beauty+moisturizer"],
              ["Best Shampoo for Curly Hair", "/search?q=best+shampoo+curly+hair"],
              ["Jewelry Under $200", "/search?q=jewelry+under+200"],
              ["Celebrity Hair Routines", "/search?q=celebrity+hair+routine"],
            ].map(([label, href]) => (
              <Link key={label as string} href={href as string}
                className="no-underline p-4 rounded-xl transition-all text-sm font-medium"
                style={{ background: "#fff", border: "1px solid var(--border)", color: "var(--foreground)", fontFamily: "system-ui, sans-serif" }}>
                {label} →
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
