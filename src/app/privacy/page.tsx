import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — DupeDose",
  description: "How DupeDose collects, uses, and protects information, including cookies and affiliate tracking.",
};

const UPDATED = "June 27, 2026";

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--rose)", fontFamily: "system-ui, sans-serif" }}>
        Legal
      </p>
      <h1 style={{ fontSize: "2rem", fontFamily: "Georgia, serif", fontWeight: 700, marginBottom: "0.5rem" }}>
        Privacy Policy
      </h1>
      <p className="mb-8" style={{ color: "var(--muted)", fontFamily: "system-ui, sans-serif", fontSize: "0.85rem" }}>
        Last updated: {UPDATED}
      </p>

      <div style={{ fontFamily: "system-ui, sans-serif", color: "var(--muted)", lineHeight: 1.8, fontSize: "0.95rem" }}>
        {[
          {
            h: "Who we are",
            b: "DupeDose (“we”, “us”) operates this website as a product-discovery and comparison service for beauty, hair care, and jewelry. This policy explains what information we collect and how we use it.",
          },
          {
            h: "Information we collect",
            b: "We do not require an account and do not ask for personal information such as your name or address to browse. We collect limited, non-identifying usage data: the search terms you enter and which “View Deal” links you click, along with standard technical details (browser type, referring page, and an anonymous session identifier). This helps us improve our recommendations and understand which products are popular.",
          },
          {
            h: "Cookies and tracking",
            b: "We and our partners use cookies and similar technologies. When you click an outbound “View Deal” link, the destination retailer (and affiliate networks such as the Amazon Associates Program, Skimlinks, Rakuten, or Impact) may set cookies that record that the visit came from DupeDose, so any resulting purchase can be attributed to us. You can disable cookies in your browser settings, though some features may not work as intended.",
          },
          {
            h: "Affiliate links & the Amazon Associates Program",
            b: "DupeDose is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com. As an Amazon Associate, we earn from qualifying purchases. We also participate in other affiliate programs. When you click an affiliate link and make a purchase, we may earn a commission at no additional cost to you. See our Affiliate Disclosure for more.",
          },
          {
            h: "How we use information",
            b: "We use the data we collect to operate and improve the site, rank and personalize product recommendations, measure the performance of outbound links, and maintain security. We do not sell your personal information.",
          },
          {
            h: "Third-party services",
            b: "Outbound links take you to third-party retailers and networks that operate under their own privacy policies. We are not responsible for the content or privacy practices of those sites; we encourage you to review their policies.",
          },
          {
            h: "Children’s privacy",
            b: "DupeDose is intended for adults and is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us information, please contact us and we will delete it.",
          },
          {
            h: "Your choices",
            b: "You can browse without providing personal information, clear or block cookies in your browser, and use browser “do not track” settings. Because our usage logs are anonymous, they are not linked to your identity.",
          },
          {
            h: "Changes to this policy",
            b: "We may update this policy from time to time. Material changes will be reflected by the “last updated” date above.",
          },
          {
            h: "Contact",
            b: "Questions about this policy can be sent to privacy@dupedose.com.",
          },
        ].map((s) => (
          <section key={s.h} className="mb-6">
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.15rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.5rem" }}>
              {s.h}
            </h2>
            <p>{s.b}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
