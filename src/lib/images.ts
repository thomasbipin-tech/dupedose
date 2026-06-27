// ────────────────────────────────────────────────────────────
// Resolve a product's display image.
// - If a real (http) image URL exists (e.g. from an affiliate feed), use it.
// - Otherwise fall back to the generated branded SVG tile in /public/products.
// This means real photos automatically take over the moment feeds provide them.
// ────────────────────────────────────────────────────────────

export function productImage(p: { id: string; image?: string }): string {
  if (p.image && /^https?:\/\//.test(p.image)) return p.image;
  return `/products/${p.id}.svg`;
}

export function isRealPhoto(p: { image?: string }): boolean {
  return Boolean(p.image && /^https?:\/\//.test(p.image));
}
