import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "DupeDose — Find Affordable Dupes for Beauty, Hair & Jewelry",
    template: "%s · DupeDose",
  },
  description: SITE_DESCRIPTION,
  keywords: "beauty dupes, hair care alternatives, jewelry dupes, luxury alternatives, skincare dupes, makeup dupes, fragrance dupes, affordable alternatives",
  alternates: { canonical: "/" },
  openGraph: {
    title: "DupeDose — Find Your Perfect Beauty Match",
    description: SITE_DESCRIPTION,
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
  },
  twitter: { card: "summary_large_image", title: "DupeDose", description: SITE_DESCRIPTION },
  robots: { index: true, follow: true },
};

// Site-wide structured data so Google + AI answer engines understand the brand.
const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
};
const siteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([orgJsonLd, siteJsonLd]) }} />
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
