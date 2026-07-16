import Script from "next/script";

// Google Analytics 4. Defaults to the DupeDose property; override with
// NEXT_PUBLIC_GA_ID (Vercel → Settings → Environment Variables) if needed.
export default function Analytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID || "G-X7E0GQ40LC";
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
      {/* Revenue signal: every outbound affiliate click (all offers route
          through /api/go/<offerId>). Mark "affiliate_click" as a key event in
          GA4 (Admin → Key events) to measure conversion, not just traffic. */}
      <Script id="ga4-affiliate-clicks" strategy="afterInteractive">
        {`
          document.addEventListener('click', function (e) {
            var el = e.target instanceof Element ? e.target.closest('a[href*="/api/go/"]') : null;
            if (!el || typeof window.gtag !== 'function') return;
            var m = (el.getAttribute('href') || '').match(/\\/api\\/go\\/([^/?#]+)/);
            window.gtag('event', 'affiliate_click', {
              offer_id: m ? m[1] : '',
              page_path: location.pathname,
              transport_type: 'beacon'
            });
          }, true);
        `}
      </Script>
    </>
  );
}
