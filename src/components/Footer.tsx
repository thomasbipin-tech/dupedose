import Link from "next/link";

export default function Footer() {
  const col = (title: string, links: [string, string][]) => (
    <div>
      <p className="eyebrow" style={{ marginBottom: 14 }}>{title}</p>
      {links.map(([l, h]) => (
        <Link key={h} href={h} className="block no-underline uline" style={{ width: "fit-content", fontSize: "0.85rem", color: "var(--foreground)", marginBottom: 9 }}>
          {l}
        </Link>
      ))}
    </div>
  );

  return (
    <footer style={{ background: "#fff", borderTop: "1px solid var(--border)" }} className="pt-14 pb-10 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div>
            <p style={{ fontSize: "1.35rem", fontWeight: 700, letterSpacing: "0.02em", marginBottom: 10 }}>DUPEDOSE</p>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.6, maxWidth: 220 }}>
              The smart way to find affordable dupes for the beauty, hair, and jewelry you love.
            </p>
          </div>
          {col("Shop", [["Beauty", "/category/beauty"], ["Hair", "/category/hair"], ["Jewelry", "/category/jewelry"]])}
          {col("Tools", [["Find My Dupe", "/search"], ["Compare", "/compare"], ["Beauty Quiz", "/quiz"]])}
          {col("Company", [["About", "/about"], ["Affiliate Disclosure", "/disclosure"], ["Privacy Policy", "/privacy"]])}
        </div>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 22 }} className="flex flex-col gap-4">
          <p style={{ fontSize: "0.74rem", color: "var(--muted)", lineHeight: 1.6, maxWidth: 760 }}>
            <strong style={{ color: "var(--foreground)" }}>As an Amazon Associate, DupeDose earns from qualifying purchases.</strong>{" "}
            We also participate in other affiliate programs and may earn a commission, at no extra cost to you. Prices are
            reference estimates that may vary — confirm the current price on the retailer&rsquo;s website.
          </p>
          <p style={{ fontSize: "0.74rem", color: "var(--muted-2)" }}>© 2026 DupeDose. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
