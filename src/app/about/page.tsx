import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — DupeDose",
  description: "What DupeDose is, how our product recommendations work, and how we make money.",
};

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--rose)", fontFamily: "system-ui, sans-serif" }}>
        About
      </p>
      <h1 style={{ fontSize: "2rem", fontFamily: "Georgia, serif", fontWeight: 700, marginBottom: "1.5rem" }}>
        Smart beauty, for less.
      </h1>

      <div style={{ fontFamily: "system-ui, sans-serif", color: "var(--muted)", lineHeight: 1.8, fontSize: "0.95rem" }}>
        <p className="mb-4">
          DupeDose is an AI-powered discovery engine for <strong style={{ color: "var(--foreground)" }}>beauty — skincare, makeup, fragrance, and hair care</strong>.
          Tell us a product, brand, ingredient, or look you love, and we surface the best alternatives and
          &ldquo;dupes&rdquo; — ranked by a match score with a clear explanation of why each one is similar.
        </p>
        <p className="mb-4">
          We built DupeDose for value-conscious shoppers who love high-end products but want comparable results
          for less — and for anyone who prefers to choose skincare and hair care by ingredient and concern rather
          than by marketing. Every product has a detail page with key ingredients and attributes, side-by-side
          comparisons, ratings, and links to retailers where you can buy it.
        </p>

        <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)", margin: "1.5rem 0 0.5rem" }}>
          How our recommendations work
        </h2>
        <p className="mb-4">
          Our matching engine compares products by ingredients, formulation attributes, category, and price tier to
          estimate how close an alternative is to the original. Recommendations are based on these product
          characteristics — never on how much a retailer pays us.
        </p>

        <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)", margin: "1.5rem 0 0.5rem" }}>
          How we make money
        </h2>
        <p className="mb-4">
          DupeDose is free to use. When you click a &ldquo;View Deal&rdquo; link and make a purchase, we may earn a
          small affiliate commission at no extra cost to you. As an Amazon Associate, we earn from qualifying
          purchases. This keeps the site free and independent. Read our{" "}
          <Link href="/disclosure" style={{ color: "var(--rose)" }}>Affiliate Disclosure</Link> and{" "}
          <Link href="/privacy" style={{ color: "var(--rose)" }}>Privacy Policy</Link> for details.
        </p>

        <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)", margin: "1.5rem 0 0.5rem" }}>
          A note on prices &amp; brands
        </h2>
        <p>
          Prices shown are reference estimates and may change — always confirm the current price on the retailer&rsquo;s
          website. Brand names are used to describe and compare products; DupeDose is not affiliated with, endorsed by,
          or sponsored by the brands or retailers mentioned.
        </p>
      </div>
    </div>
  );
}
