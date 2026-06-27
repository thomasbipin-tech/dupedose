import { Product, formatPrice } from "@/lib/types";

interface ComparisonTableProps {
  products: Product[];
}

function CheckIcon({ yes }: { yes: boolean }) {
  return yes
    ? <span style={{ color: "#059669", fontSize: "1.1rem" }}>✓</span>
    : <span style={{ color: "#e5e7eb", fontSize: "1.1rem" }}>—</span>;
}

export default function ComparisonTable({ products }: ComparisonTableProps) {
  if (products.length < 2) return null;

  const allAttrKeys = Array.from(new Set(products.flatMap(p => Object.keys(p.attributes ?? {}))));

  return (
    <div className="overflow-x-auto rounded-2xl" style={{ border: "1px solid var(--border)" }}>
      <table className="w-full" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
        <thead>
          <tr style={{ background: "var(--hero-bg)" }}>
            <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "system-ui, sans-serif", width: 160 }}>
              Attribute
            </th>
            {products.map((p) => (
              <th key={p.id} className="px-6 py-4 text-center" style={{ minWidth: 180 }}>
                <p className="text-xs font-medium mb-0.5 uppercase tracking-wide" style={{ color: "var(--gold)", fontFamily: "system-ui, sans-serif" }}>
                  {p.brandName}
                </p>
                <p className="text-sm font-semibold leading-snug" style={{ color: "#fff", fontFamily: "Georgia, serif" }}>
                  {p.name}
                </p>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Price */}
          <tr style={{ borderTop: "1px solid var(--border)" }}>
            <td className="px-6 py-4 text-sm font-medium" style={{ color: "var(--muted)", fontFamily: "system-ui, sans-serif" }}>Price</td>
            {products.map((p) => (
              <td key={p.id} className="px-6 py-4 text-center font-bold" style={{ fontFamily: "Georgia, serif", fontSize: "1.05rem", color: "var(--foreground)" }}>
                {formatPrice(p.price)}
              </td>
            ))}
          </tr>
          {/* Rating */}
          <tr style={{ borderTop: "1px solid var(--border)", background: "rgba(0,0,0,0.02)" }}>
            <td className="px-6 py-4 text-sm font-medium" style={{ color: "var(--muted)", fontFamily: "system-ui, sans-serif" }}>Rating</td>
            {products.map((p) => (
              <td key={p.id} className="px-6 py-4 text-center">
                <span className="font-semibold" style={{ fontFamily: "system-ui, sans-serif", color: "var(--gold)" }}>
                  ★ {p.rating.toFixed(1)}
                </span>
                <span className="block text-xs mt-0.5" style={{ color: "var(--muted)", fontFamily: "system-ui, sans-serif" }}>
                  ({p.reviewCount.toLocaleString()} reviews)
                </span>
              </td>
            ))}
          </tr>
          {/* Category/Subcategory */}
          <tr style={{ borderTop: "1px solid var(--border)" }}>
            <td className="px-6 py-4 text-sm font-medium" style={{ color: "var(--muted)", fontFamily: "system-ui, sans-serif" }}>Type</td>
            {products.map((p) => (
              <td key={p.id} className="px-6 py-4 text-center text-sm" style={{ fontFamily: "system-ui, sans-serif", color: "var(--foreground)" }}>
                {p.subcategory}
              </td>
            ))}
          </tr>
          {/* Dynamic attributes */}
          {allAttrKeys.map((key, i) => (
            <tr key={key} style={{ borderTop: "1px solid var(--border)", background: i % 2 === 0 ? "rgba(0,0,0,0.02)" : "transparent" }}>
              <td className="px-6 py-4 text-sm font-medium capitalize" style={{ color: "var(--muted)", fontFamily: "system-ui, sans-serif" }}>
                {key.replace(/([A-Z])/g, " $1").trim()}
              </td>
              {products.map((p) => {
                const val = p.attributes?.[key];
                return (
                  <td key={p.id} className="px-6 py-4 text-center text-sm" style={{ fontFamily: "system-ui, sans-serif", color: "var(--foreground)" }}>
                    {val === undefined ? "—"
                      : typeof val === "boolean" ? <CheckIcon yes={val} />
                      : typeof val === "number" && key.toLowerCase().includes("level") ? val
                      : typeof val === "number" ? (
                        <span>
                          <span className="font-semibold">{val}%</span>
                          <span className="block mt-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)", width: "80px", margin: "4px auto 0" }}>
                            <span className="block h-full rounded-full" style={{ width: `${val}%`, background: "var(--rose)" }} />
                          </span>
                        </span>
                      ) : String(val)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
