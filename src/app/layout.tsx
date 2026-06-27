import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "DupeDose — Beauty, Hair & Jewelry Discovery",
  description: "AI-powered discovery engine for beauty, hair care, and jewelry. Find luxury alternatives, celebrity-inspired looks, and personalized recommendations.",
  keywords: "beauty dupes, hair care alternatives, jewelry dupes, luxury alternatives, skincare comparison",
  openGraph: {
    title: "DupeDose — Find Your Perfect Beauty Match",
    description: "Tell us what you want. We'll find the best alternatives.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
