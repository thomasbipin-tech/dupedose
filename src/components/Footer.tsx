import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ background: "var(--hero-bg)", borderTop: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
      className="py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <p className="text-2xl font-bold mb-3" style={{ color: "var(--gold)", fontFamily: "Georgia, serif" }}>
              Dupe<span style={{ color: "#fff" }}>Dose</span>
            </p>
            <p className="text-xs leading-relaxed" style={{ fontFamily: "system-ui, sans-serif" }}>
              The AI-powered beauty and luxury alternative engine.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "system-ui, sans-serif" }}>Discover</p>
            {[["Beauty", "/category/beauty"], ["Hair Care", "/category/hair"], ["Jewelry", "/category/jewelry"]].map(([l, h]) => (
              <Link key={h} href={h} className="block text-sm no-underline mb-2 transition-colors"
                style={{ color: "rgba(255,255,255,0.5)", fontFamily: "system-ui, sans-serif" }}>
                {l}
              </Link>
            ))}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "system-ui, sans-serif" }}>Tools</p>
            {[["Compare Products", "/compare"], ["Beauty Quiz", "/quiz"], ["Find My Dupe", "/search"]].map(([l, h]) => (
              <Link key={h} href={h} className="block text-sm no-underline mb-2"
                style={{ color: "rgba(255,255,255,0.5)", fontFamily: "system-ui, sans-serif" }}>
                {l}
              </Link>
            ))}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "system-ui, sans-serif" }}>Popular</p>
            {[["Best Olaplex Dupes", "/search?q=olaplex+dupes"], ["Cartier Alternatives", "/search?q=cartier+alternatives"], ["Luxury Skincare Dupes", "/search?q=luxury+skincare+dupes"]].map(([l, h]) => (
              <Link key={h} href={h} className="block text-sm no-underline mb-2"
                style={{ color: "rgba(255,255,255,0.5)", fontFamily: "system-ui, sans-serif" }}>
                {l}
              </Link>
            ))}
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col gap-4">
          {/* Required Amazon Associates disclosure — clear & conspicuous, site-wide */}
          <p className="text-xs leading-relaxed" style={{ fontFamily: "system-ui, sans-serif", color: "rgba(255,255,255,0.55)" }}>
            <strong style={{ color: "rgba(255,255,255,0.75)" }}>As an Amazon Associate, DupeDose earns from qualifying purchases.</strong>{" "}
            We also participate in other affiliate programs and may earn a commission when you buy through links on our site, at no extra cost to you.
            Prices are reference estimates that may vary — confirm the current price on the retailer&rsquo;s website. We do not display live Amazon prices.
          </p>
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-xs" style={{ fontFamily: "system-ui, sans-serif" }}>© 2026 DupeDose. All rights reserved.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              {[["About", "/about"], ["Affiliate Disclosure", "/disclosure"], ["Privacy Policy", "/privacy"]].map(([l, h]) => (
                <Link key={h} href={h} className="text-xs no-underline" style={{ fontFamily: "system-ui, sans-serif", color: "rgba(255,255,255,0.5)" }}>
                  {l}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
