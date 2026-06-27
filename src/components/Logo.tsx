// Monochrome DupeDose logo — a radial "dose" dot-mark + wordmark, drawn in
// currentColor so it blends quietly into whatever surface it sits on.

function DotMark({ size = 30 }: { size?: number }) {
  const c = 16;
  const rings = [
    { r: 0, count: 1, dot: 2.7 },
    { r: 6.2, count: 8, dot: 1.5 },
    { r: 12, count: 14, dot: 1.25 },
  ];
  const dots: { x: number; y: number; r: number }[] = [];
  for (const ring of rings) {
    if (ring.r === 0) { dots.push({ x: c, y: c, r: ring.dot }); continue; }
    for (let i = 0; i < ring.count; i++) {
      const a = (i / ring.count) * Math.PI * 2 - Math.PI / 2;
      dots.push({ x: c + ring.r * Math.cos(a), y: c + ring.r * Math.sin(a), r: ring.dot });
    }
  }
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
      {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.r} />)}
    </svg>
  );
}

export default function Logo({ size = 28, mark = true }: { size?: number; mark?: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10, color: "var(--foreground)" }}>
      {mark && <DotMark size={size} />}
      <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: size * 0.82, fontWeight: 700, letterSpacing: "0.01em", lineHeight: 1 }}>
        DupeDose
      </span>
    </span>
  );
}
