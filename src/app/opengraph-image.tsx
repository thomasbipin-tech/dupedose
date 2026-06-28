import { ImageResponse } from "next/og";

export const alt = "DupeDose — Find affordable dupes for beauty, hair & jewelry";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#111111",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", fontSize: 34, letterSpacing: 10, opacity: 0.55 }}>DUPEDOSE</div>
        <div style={{ display: "flex", fontSize: 88, fontWeight: 700, marginTop: 24, textAlign: "center" }}>
          Find affordable dupes
        </div>
        <div style={{ display: "flex", fontSize: 38, opacity: 0.7, marginTop: 18 }}>Beauty · Hair · Jewelry</div>
      </div>
    ),
    size
  );
}
