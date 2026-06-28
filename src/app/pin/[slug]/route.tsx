import { ImageResponse } from "next/og";
import sharp from "sharp";
import { getProductBySlug, getProductAlternatives } from "@/lib/db";
import { formatPrice } from "@/lib/types";
import { isRealPhoto } from "@/lib/images";

// Pinterest-optimised share image: 1000×1500 (2:3, the format Pinterest favours).
// Renders "The Original vs The Dupe" with the price saving — one per product.
// URL: /pin/<slug>  → image/png.  Uses real photos when available; otherwise a
// branded colour block with the brand initial (Satori can't rasterise our SVG tiles).

export const contentType = "image/png";
const SIZE = { width: 1000, height: 1500 };

const ROSE = "#b76e79";
const INK = "#1a1a1a";

function initialBlock(letter: string, bg: string) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        background: bg,
        color: "#fff",
        fontSize: 160,
        fontWeight: 700,
      }}
    >
      {letter}
    </div>
  );
}

// Satori only rasterises PNG/JPEG, but Supabase serves many of our images as
// webp (regardless of file extension). Fetch + transcode to a PNG data URI so
// the photo actually renders; return null on any failure so we can fall back.
async function toPngDataUri(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const png = await sharp(Buffer.from(await res.arrayBuffer()))
      .resize(440, 440, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return null;
  }
}

function photo(src: string) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" width={420} height={420} style={{ width: "100%", height: "100%", objectFit: "contain", background: "#fff" }} />;
}

function card(label: string, brand: string, name: string, price: number, img: React.ReactNode, accent: string) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: 420, alignItems: "center" }}>
      <div style={{ display: "flex", fontSize: 24, letterSpacing: 4, color: accent, fontWeight: 700, marginBottom: 14 }}>{label}</div>
      <div style={{ display: "flex", width: 420, height: 420, borderRadius: 24, overflow: "hidden", border: `2px solid ${accent}` }}>{img}</div>
      <div style={{ display: "flex", fontSize: 26, letterSpacing: 2, textTransform: "uppercase", color: "#888", marginTop: 22 }}>{brand}</div>
      <div style={{ display: "flex", fontSize: 32, fontWeight: 600, color: INK, marginTop: 6, textAlign: "center", lineHeight: 1.2, maxWidth: 420 }}>
        {name.length > 46 ? name.slice(0, 44) + "…" : name}
      </div>
      <div style={{ display: "flex", fontSize: 56, fontWeight: 700, color: accent, marginTop: 12 }}>{formatPrice(price)}</div>
    </div>
  );
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return new ImageResponse(
      (
        <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", background: "#fff", color: INK }}>
          <div style={{ display: "flex", fontSize: 40, letterSpacing: 10, color: ROSE }}>DUPEDOSE</div>
          <div style={{ display: "flex", fontSize: 60, fontWeight: 700, marginTop: 20 }}>Find affordable dupes</div>
        </div>
      ),
      SIZE
    );
  }

  const alts = await getProductAlternatives(product.id);
  const dupe = alts.filter((a) => a.price < product.price).sort((a, b) => b.matchScore - a.matchScore)[0] ?? alts[0];

  const [origUri, dupeUri] = await Promise.all([
    isRealPhoto(product) ? toPngDataUri(product.image) : Promise.resolve(null),
    dupe && isRealPhoto(dupe) ? toPngDataUri(dupe.image) : Promise.resolve(null),
  ]);

  const origImg = origUri ? photo(origUri) : initialBlock((product.brandName || "?").charAt(0).toUpperCase(), INK);
  const dupeImg = dupe ? (dupeUri ? photo(dupeUri) : initialBlock((dupe.brandName || "?").charAt(0).toUpperCase(), ROSE)) : null;

  const savings = dupe ? product.price - dupe.price : 0;
  const pct = dupe && product.price > 0 ? Math.round((savings / product.price) * 100) : 0;

  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "#faf7f5", padding: 56, justifyContent: "space-between" }}>
        {/* header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 30, letterSpacing: 10, color: ROSE, fontWeight: 700 }}>DUPEDOSE</div>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 800, color: INK, marginTop: 10, textAlign: "center" }}>
            {dupe ? `Save ${pct}%` : "Find the dupe"}
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#777", marginTop: 4 }}>
            {dupe ? `on a ${product.brandName} dupe` : `for ${product.brandName}`}
          </div>
        </div>

        {/* cards */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          {card("THE ORIGINAL", product.brandName, product.name, product.price, origImg, INK)}
          {dupe && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: 80 }}>
              <div style={{ display: "flex", fontSize: 40, fontWeight: 700, color: ROSE }}>vs</div>
            </div>
          )}
          {dupe && dupeImg && card("THE DUPE", dupe.brandName, dupe.name, dupe.price, dupeImg, ROSE)}
        </div>

        {/* savings badge / footer */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {dupe && savings > 0 && (
            <div style={{ display: "flex", background: ROSE, color: "#fff", fontSize: 40, fontWeight: 700, padding: "18px 44px", borderRadius: 999, marginBottom: 22 }}>
              Save {formatPrice(savings)}
            </div>
          )}
          <div style={{ display: "flex", fontSize: 34, color: INK, fontWeight: 600 }}>More dupes → dupedose.com</div>
        </div>
      </div>
    ),
    SIZE
  );
}
