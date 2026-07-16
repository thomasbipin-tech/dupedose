import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import ProductCard from "@/components/ProductCard";
import { CATEGORIES, POPULAR_SEARCHES } from "@/lib/data";
import { getTrendingProducts, getProductsByCategory, getProductAlternatives } from "@/lib/db";
import { Category, formatPrice } from "@/lib/types";
import { productImage } from "@/lib/images";

export const revalidate = 3600;

export default async function HomePage() {
  const trending = await getTrendingProducts();

  // Above-the-fold proof: real original→dupe pairs with the actual saving,
  // so visitors see the value before they type anything.
  const originals = trending.filter((p) => p.isOriginal && p.price > 0).slice(0, 8);
  const pairsRaw = await Promise.all(
    originals.map(async (orig) => {
      const alts = await getProductAlternatives(orig.id);
      const dupe = alts.filter((a) => a.price > 0 && a.price < orig.price).sort((a, b) => b.matchScore - a.matchScore)[0];
      return dupe ? { orig, dupe, pct: Math.round((1 - dupe.price / orig.price) * 100) } : null;
    })
  );
  const pairs = pairsRaw.filter((p): p is NonNullable<typeof p> => p !== null && p.pct >= 10)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 4);
  // A representative real product image per category for the tile backgrounds.
  const covers: Record<string, string> = {};
  await Promise.all(
    CATEGORIES.map(async (c) => {
      const ps = await getProductsByCategory(c.slug as Category);
      covers[c.slug] = ps.find((p) => p.image && /^https?:/.test(p.image))?.image ?? "";
    })
  );

  return (
    <>
      {/* ── HERO ── */}
      <section style={{ background: "var(--background-alt)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ paddingTop: "3rem", paddingBottom: "3rem" }}>
          <p className="eyebrow fade-up" style={{ marginBottom: 14 }}>AI Dupe Discovery · Beauty · Hair · Jewelry</p>
          <h1 className="fade-up fade-up-delay-1" style={{ fontSize: "clamp(2.1rem, 5vw, 3.4rem)", fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: "0.8rem" }}>
            Find the affordable dupe for any <span className="shimmer-text">luxury product.</span>
          </h1>
          <p className="fade-up fade-up-delay-2" style={{ fontSize: "1.02rem", color: "var(--muted)", maxWidth: 560, margin: "0 auto 1.6rem", lineHeight: 1.6 }}>
            Real alternatives, ranked by match score — with the reasoning and the exact saving behind every pick.
          </p>
          <div className="fade-up fade-up-delay-3 max-w-2xl mx-auto mb-4">
            <SearchBar large />
          </div>
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {POPULAR_SEARCHES.slice(0, 6).map((s) => (
              <Link key={s} href={`/search?q=${encodeURIComponent(s)}`} className="no-underline"
                style={{ padding: "5px 12px", fontSize: "0.74rem", color: "var(--foreground)", background: "#fff", border: "1px solid var(--border-strong)", borderRadius: 999 }}>
                {s}
              </Link>
            ))}
          </div>

          {/* ── PROOF: real dupe pairs, visible before anyone types ── */}
          {pairs.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
              {pairs.map(({ orig, dupe, pct }) => (
                <Link key={orig.id} href={`/product/${orig.slug}`} className="no-underline group">
                  <div className="product-card relative h-full" style={{ background: "#fff", border: "1px solid var(--border)", padding: "16px 16px 14px" }}>
                    <span style={{ position: "absolute", top: 12, right: 12, background: "var(--rose, #b76e79)", color: "#fff", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.05em", padding: "4px 9px", borderRadius: 999 }}>
                      SAVE {pct}%
                    </span>
                    <div className="flex items-center gap-3" style={{ marginBottom: 10 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={productImage(orig)} alt={`${orig.brandName} ${orig.name}`} width={48} height={48} style={{ width: 48, height: 48, objectFit: "contain", background: "#fff", border: "1px solid var(--border)", borderRadius: 8, flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <p className="truncate" style={{ fontSize: "0.7rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)" }}>{orig.brandName}</p>
                        <p className="truncate" style={{ fontSize: "0.82rem", fontWeight: 600 }}>{orig.name}</p>
                        <p style={{ fontSize: "0.8rem", color: "var(--muted)", textDecoration: "line-through" }}>{formatPrice(orig.price)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={productImage(dupe)} alt={`${dupe.brandName} ${dupe.name}`} width={48} height={48} style={{ width: 48, height: 48, objectFit: "contain", background: "#fff", border: "1px solid var(--rose, #b76e79)", borderRadius: 8, flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <p className="truncate" style={{ fontSize: "0.7rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--rose, #b76e79)" }}>{dupe.brandName} · dupe</p>
                        <p className="truncate" style={{ fontSize: "0.82rem", fontWeight: 600 }}>{dupe.name}</p>
                        <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--rose, #b76e79)" }}>{formatPrice(dupe.price)}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
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
              <div className="product-card relative overflow-hidden flex flex-col justify-between"
                style={{ minHeight: 380, background: covers[cat.slug] ? `#eee` : "var(--background-alt)", border: "1px solid var(--border)" }}>
                {covers[cat.slug] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={covers[cat.slug]} alt={cat.label} className="pc-img absolute inset-0 w-full h-full" style={{ objectFit: "cover", objectPosition: "right center", opacity: 0.95 }} />
                )}
                {/* legibility scrim — solid white under the left-aligned text, clear on the right so the photo shows */}
                <div className="absolute inset-0" style={{ background: "linear-gradient(100deg, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 42%, rgba(255,255,255,0.55) 60%, rgba(255,255,255,0) 78%)" }} />
                <div className="relative p-7">
                  <div className="flex items-center justify-center" style={{ width: 46, height: 46, borderRadius: "50%", background: "#fff", boxShadow: "var(--shadow-sm)", fontSize: "1.2rem", marginBottom: 16 }}>{cat.icon}</div>
                  <h3 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: 6 }}>{cat.label}</h3>
                  <p style={{ fontSize: "0.9rem", color: "var(--foreground)", maxWidth: 200, lineHeight: 1.5 }}>{cat.description}</p>
                </div>
                <div className="relative p-7 pt-0">
                  <span className="inline-block" style={{ background: "#fff", color: "var(--foreground)", padding: "10px 18px", fontSize: "0.74rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", boxShadow: "var(--shadow-sm)" }}>
                    Explore {cat.label} →
                  </span>
                </div>
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
