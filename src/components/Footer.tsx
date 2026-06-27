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
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs" style={{ fontFamily: "system-ui, sans-serif" }}>© 2026 DupeDose. All rights reserved.</p>
          <Link href="/disclosure" className="text-xs no-underline" style={{ fontFamily: "system-ui, sans-serif", color: "rgba(255,255,255,0.5)" }}>
            DupeDose earns affiliate commissions from qualifying purchases. Prices for reference only. Affiliate disclosure →
          </Link>
        </div>
      </div>
    </footer>
  );
}
