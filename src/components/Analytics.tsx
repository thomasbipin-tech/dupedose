import Script from "next/script";

// Google Analytics 4. Set NEXT_PUBLIC_GA_ID (format: G-XXXXXXX) in the
// environment (Vercel → Settings → Environment Variables). When the var is
// absent (e.g. local dev) nothing is rendered, so no tracking runs.
export default function Analytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID;
  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}');
        `}
      </Script>
    </>
  );
}
