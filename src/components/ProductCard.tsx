import Link from "next/link";
import { Product, formatPrice, dupleLevelLabel, DupeLevel } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  matchScore?: number;
  dupeLevel?: DupeLevel;
  reason?: string;
}

const PLACEHOLDER_COLORS: Record<string, string> = {
  beauty: "linear-gradient(135deg, #f5dde3 0%, #e8c4cd 100%)",
  hair: "linear-gradient(135deg, #f5ead4 0%, #e8d4a4 100%)",
  jewelry: "linear-gradient(135deg, #ede9fe 0%, #d4c4f4 100%)",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? "var(--gold)" : "#e5e7eb"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontFamily: "system-ui, sans-serif" }}>
        {rating.toFixed(1)}
      </span>
    </span>
  );
}

export default function ProductCard({ product, matchScore, dupeLevel, reason }: ProductCardProps) {
  const bgGrad = PLACEHOLDER_COLORS[product.category] ?? PLACEHOLDER_COLORS.beauty;

  return (
    <Link href={`/product/${product.slug}`} className="no-underline block">
      <div className="product-card rounded-2xl overflow-hidden" style={{ background: "var(--card-bg)", border: "1px solid var(--border)" }}>
        {/* Image area */}
        <div className="relative overflow-hidden" style={{ background: bgGrad, height: 200 }}>
          {matchScore !== undefined && (
            <div className="absolute top-3 left-3">
              <span className={`match-badge ${matchScore >= 90 ? "match-high" : matchScore >= 80 ? "match-mid" : "match-budget"}`}>
                {matchScore}% match
              </span>
            </div>
          )}
          {dupeLevel && (
            <div className="absolute top-3 right-3">
              <span className={`match-badge ${dupeLevel === "premium" ? "match-premium" : dupeLevel === "similar" ? "match-mid" : "match-budget"}`}>
                {dupleLevelLabel(dupeLevel)}
              </span>
            </div>
          )}
          {/* Placeholder icon */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <span style={{ fontSize: "4rem" }}>
              {product.category === "jewelry" ? "◇" : product.category === "hair" ? "◈" : "✦"}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs font-medium mb-1 uppercase tracking-wide" style={{ color: "var(--rose)", fontFamily: "system-ui, sans-serif" }}>
            {product.brandName}
          </p>
          <p className="font-semibold leading-snug mb-2 line-clamp-2" style={{ fontSize: "0.95rem", color: "var(--foreground)", fontFamily: "Georgia, serif" }}>
            {product.name}
          </p>
          <StarRating rating={product.rating} />
          {reason && (
            <p className="mt-2 text-xs leading-relaxed line-clamp-2" style={{ color: "var(--muted)", fontFamily: "system-ui, sans-serif" }}>
              {reason}
            </p>
          )}
          <div className="flex items-center justify-between mt-3">
            <span className="font-bold" style={{ fontSize: "1.1rem", color: "var(--foreground)", fontFamily: "Georgia, serif" }}>
              {formatPrice(product.price)}
            </span>
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{ background: "var(--rose)", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
              View →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
