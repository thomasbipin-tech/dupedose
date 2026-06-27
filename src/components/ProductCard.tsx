import Link from "next/link";
import { Product, formatPrice, dupleLevelLabel, DupeLevel } from "@/lib/types";
import { productImage } from "@/lib/images";

interface ProductCardProps {
  product: Product;
  matchScore?: number;
  dupeLevel?: DupeLevel;
  reason?: string;
}

const PLACEHOLDER_COLORS: Record<string, string> = {
  beauty: "linear-gradient(135deg, #f6dee4 0%, #ecc7d1 100%)",
  hair: "linear-gradient(135deg, #f5ead4 0%, #e8d4a4 100%)",
  jewelry: "linear-gradient(135deg, #ede9fe 0%, #d4c4f4 100%)",
};

function StarRating({ rating, count }: { rating: number; count?: number }) {
  return (
    <span className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? "var(--gold)" : "#e7e0d6"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span style={{ fontSize: "0.72rem", color: "var(--muted)", fontFamily: "var(--font-sans)", marginLeft: 2 }}>
        {rating.toFixed(1)}{count ? ` (${count > 999 ? `${Math.round(count / 1000)}k` : count})` : ""}
      </span>
    </span>
  );
}

export default function ProductCard({ product, matchScore, dupeLevel, reason }: ProductCardProps) {
  const bgGrad = PLACEHOLDER_COLORS[product.category] ?? PLACEHOLDER_COLORS.beauty;

  return (
    <Link href={`/product/${product.slug}`} className="no-underline block group">
      <div className="product-card overflow-hidden h-full flex flex-col" style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--r-md)" }}>
        {/* Image area */}
        <div className="relative overflow-hidden" style={{ background: bgGrad, aspectRatio: "1 / 1" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={productImage(product)} alt={`${product.brandName} ${product.name}`} loading="lazy"
            className="pc-img absolute inset-0 w-full h-full" style={{ objectFit: "cover" }} />
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
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col flex-1">
          <p className="eyebrow mb-1.5" style={{ color: "var(--rose)" }}>{product.brandName}</p>
          <p className="font-serif leading-snug mb-2 line-clamp-2" style={{ fontSize: "1rem", fontWeight: 700, color: "var(--foreground)" }}>
            {product.name}
          </p>
          <StarRating rating={product.rating} count={product.reviewCount} />
          {reason && (
            <p className="mt-2 text-xs leading-relaxed line-clamp-2" style={{ color: "var(--muted)", fontFamily: "var(--font-sans)" }}>
              {reason}
            </p>
          )}
          <div className="flex items-center justify-between mt-auto pt-4">
            <span className="font-serif" style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--foreground)" }}>
              {formatPrice(product.price)}
            </span>
            <span className="inline-flex items-center gap-1 px-3.5 py-2 text-xs btn-primary"
              style={{ boxShadow: "none" }}>
              View →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
