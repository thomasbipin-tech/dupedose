import { ImageResponse } from "next/og";
import { getProductBySlug } from "@/lib/db";

export const alt = "Dupes & alternatives at DupeDose";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const brand = product?.brandName ?? "DupeDose";
  const name = product?.name ?? "Find affordable dupes";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#111111",
          color: "#ffffff",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", fontSize: 30, letterSpacing: 8, opacity: 0.55 }}>DUPEDOSE</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 30, letterSpacing: 4, textTransform: "uppercase", color: "#c9a87a" }}>{brand}</div>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 700, marginTop: 14, lineHeight: 1.1 }}>{name.slice(0, 80)}</div>
        </div>
        <div style={{ display: "flex", fontSize: 40, opacity: 0.85 }}>Best dupes &amp; affordable alternatives →</div>
      </div>
    ),
    size
  );
}
