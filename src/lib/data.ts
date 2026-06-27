// ────────────────────────────────────────────────────────────
// SEED FIXTURES.
//
// These arrays are the offline source of truth for DupeDose. They power
// the site directly when Supabase is not configured (via src/lib/db.ts
// fallback), and they seed the database via scripts/seed.ts when it is.
//
// Types & pure helpers now live in ./types — re-exported here so existing
// `@/lib/data` imports keep working.
// ────────────────────────────────────────────────────────────

import type {
  Brand,
  Product,
  Alternative,
  Retailer,
  Offer,
  Category,
  OfferSpec,
} from "./types";
import {
  EXTRA_BRANDS,
  EXTRA_PRODUCTS,
  EXTRA_OFFER_SPECS,
  EXTRA_ALTERNATIVES,
} from "./catalog-extended";
import {
  EXTRA2_BRANDS,
  EXTRA2_PRODUCTS,
  EXTRA2_OFFER_SPECS,
  EXTRA2_ALTERNATIVES,
} from "./catalog-extended-2";

export type {
  Brand,
  Product,
  Alternative,
  Retailer,
  Offer,
  Category,
  DupeLevel,
  AlternativeProduct,
  ProductWithAlts,
} from "./types";
export { formatPrice, dupleLevelLabel, matchScoreColor } from "./types";

// ── BRANDS ─────────────────────────────────────────────────────
export const BRANDS: Brand[] = [
  { id: "olaplex", name: "Olaplex", category: "hair", luxuryLevel: "mid", country: "USA", priceRange: "$$" },
  { id: "k18", name: "K18", category: "hair", luxuryLevel: "luxury", country: "USA", priceRange: "$$$" },
  { id: "loreal", name: "L'Oréal Paris", category: "hair", luxuryLevel: "budget", country: "France", priceRange: "$" },
  { id: "redken", name: "Redken", category: "hair", luxuryLevel: "mid", country: "USA", priceRange: "$$" },
  { id: "kerastase", name: "Kérastase", category: "hair", luxuryLevel: "luxury", country: "France", priceRange: "$$$" },
  { id: "living-proof", name: "Living Proof", category: "hair", luxuryLevel: "luxury", country: "USA", priceRange: "$$$" },
  { id: "verb", name: "Verb", category: "hair", luxuryLevel: "mid", country: "USA", priceRange: "$$" },
  { id: "the-inkey-list", name: "The INKEY List", category: "beauty", luxuryLevel: "budget", country: "UK", priceRange: "$" },

  { id: "charlotte-tilbury", name: "Charlotte Tilbury", category: "beauty", luxuryLevel: "luxury", country: "UK", priceRange: "$$$" },
  { id: "nyx", name: "NYX", category: "beauty", luxuryLevel: "budget", country: "USA", priceRange: "$" },
  { id: "la-mer", name: "La Mer", category: "beauty", luxuryLevel: "luxury", country: "USA", priceRange: "$$$$" },
  { id: "cerave", name: "CeraVe", category: "beauty", luxuryLevel: "budget", country: "USA", priceRange: "$" },
  { id: "nivea", name: "Nivea", category: "beauty", luxuryLevel: "budget", country: "Germany", priceRange: "$" },
  { id: "estee-lauder", name: "Estée Lauder", category: "beauty", luxuryLevel: "luxury", country: "USA", priceRange: "$$$" },
  { id: "the-ordinary", name: "The Ordinary", category: "beauty", luxuryLevel: "budget", country: "Canada", priceRange: "$" },
  { id: "drunk-elephant", name: "Drunk Elephant", category: "beauty", luxuryLevel: "luxury", country: "USA", priceRange: "$$$" },
  { id: "dior", name: "Dior", category: "beauty", luxuryLevel: "luxury", country: "France", priceRange: "$$$" },
  { id: "elf", name: "e.l.f. Cosmetics", category: "beauty", luxuryLevel: "budget", country: "USA", priceRange: "$" },
  { id: "tatcha", name: "Tatcha", category: "beauty", luxuryLevel: "luxury", country: "Japan", priceRange: "$$$" },
  { id: "beauty-of-joseon", name: "Beauty of Joseon", category: "beauty", luxuryLevel: "budget", country: "South Korea", priceRange: "$" },

  { id: "cartier", name: "Cartier", category: "jewelry", luxuryLevel: "luxury", country: "France", priceRange: "$$$$" },
  { id: "vancleef", name: "Van Cleef & Arpels", category: "jewelry", luxuryLevel: "luxury", country: "France", priceRange: "$$$$" },
  { id: "tiffany", name: "Tiffany & Co.", category: "jewelry", luxuryLevel: "luxury", country: "USA", priceRange: "$$$$" },
  { id: "missoma", name: "Missoma", category: "jewelry", luxuryLevel: "mid", country: "UK", priceRange: "$$" },
  { id: "mejuri", name: "Mejuri", category: "jewelry", luxuryLevel: "mid", country: "Canada", priceRange: "$$" },
  { id: "gorjana", name: "Gorjana", category: "jewelry", luxuryLevel: "mid", country: "USA", priceRange: "$$" },
  { id: "pandora", name: "Pandora", category: "jewelry", luxuryLevel: "budget", country: "Denmark", priceRange: "$" },
  ...EXTRA_BRANDS,
  ...EXTRA2_BRANDS,
];

// ── PRODUCTS ───────────────────────────────────────────────────
export const PRODUCTS: Product[] = [
  // ---------- HAIR ----------
  {
    id: "olaplex-3", brandId: "olaplex", brandName: "Olaplex", name: "No.3 Hair Perfector",
    category: "hair", subcategory: "Treatment", price: 30, image: "/products/olaplex-3.jpg",
    rating: 4.8, reviewCount: 42300, isOriginal: true,
    description: "The iconic bond-building treatment that repairs and strengthens hair from the inside out.",
    targetUser: "Colored, bleached, or heat-damaged hair",
    ingredients: ["Bis-Aminopropyl Diglycol Dimaleate", "Water", "Propylene Glycol"],
    attributes: { bondBuilding: true, repairLevel: 95, vegan: true },
    slug: "olaplex-no3-hair-perfector",
  },
  {
    id: "k18-mask", brandId: "k18", brandName: "K18", name: "Leave-In Molecular Repair Hair Mask",
    category: "hair", subcategory: "Treatment", price: 75, image: "/products/k18-mask.jpg",
    rating: 4.7, reviewCount: 18200,
    description: "Clinically proven to reverse damage in 4 minutes with patented K18Peptide™ technology.",
    targetUser: "Severely damaged or chemically treated hair",
    ingredients: ["K18Peptide™", "Water", "Cetrimonium Chloride"],
    attributes: { bondBuilding: true, repairLevel: 98, vegan: false },
    slug: "k18-leave-in-molecular-repair-hair-mask",
  },
  {
    id: "loreal-bond-repair", brandId: "loreal", brandName: "L'Oréal Paris", name: "EverPure Bond Repair Sulfate-Free Serum",
    category: "hair", subcategory: "Treatment", price: 12, image: "/products/loreal-bond.jpg",
    rating: 4.4, reviewCount: 8900,
    description: "Affordable bond repair serum that strengthens hair bonds after coloring.",
    targetUser: "Color-treated hair on a budget",
    ingredients: ["Bis-Aminopropyl Diglycol Dimaleate", "Citric Acid", "Glycerin"],
    attributes: { bondBuilding: true, repairLevel: 82, vegan: true },
    slug: "loreal-everpure-bond-repair-serum",
  },
  {
    id: "redken-acidic", brandId: "redken", brandName: "Redken", name: "Acidic Bonding Concentrate",
    category: "hair", subcategory: "Treatment", price: 39, image: "/products/redken-acidic.jpg",
    rating: 4.6, reviewCount: 12400,
    description: "Professional-grade acidic bonding treatment for all damage types.",
    targetUser: "All hair types with damage",
    ingredients: ["Citric Acid", "Bonding Complex", "Panthenol"],
    attributes: { bondBuilding: true, repairLevel: 90, vegan: true },
    slug: "redken-acidic-bonding-concentrate",
  },
  {
    id: "kerastase-genesis", brandId: "kerastase", brandName: "Kérastase", name: "Genesis Anti Hair-Fall Serum",
    category: "hair", subcategory: "Treatment", price: 56, image: "/products/kerastase-genesis.jpg",
    rating: 4.6, reviewCount: 5400, isOriginal: true,
    description: "Luxury fortifying serum that reduces hair fall due to breakage and adds shine.",
    targetUser: "Weakened, shedding hair",
    ingredients: ["Aminexil", "Edelweiss Native Cells", "Ginger Root"],
    attributes: { strengthening: true, shine: 92, vegan: false },
    slug: "kerastase-genesis-serum",
  },
  {
    id: "living-proof-full", brandId: "living-proof", brandName: "Living Proof", name: "Full Shampoo",
    category: "hair", subcategory: "Shampoo", price: 32, image: "/products/living-proof-full.jpg",
    rating: 4.5, reviewCount: 7100, isOriginal: true,
    description: "Weightless volumizing shampoo for fine, flat hair — adds fullness without buildup.",
    targetUser: "Fine, flat hair seeking volume",
    ingredients: ["Patented Healthy Hair Molecule (OFPMA)", "Glycerin"],
    attributes: { volumizing: true, shine: 80, vegan: true },
    slug: "living-proof-full-shampoo",
  },
  {
    id: "verb-ghost-oil", brandId: "verb", brandName: "Verb", name: "Ghost Oil",
    category: "hair", subcategory: "Oil", price: 20, image: "/products/verb-ghost-oil.jpg",
    rating: 4.6, reviewCount: 9800,
    description: "Weightless hair oil with moringa and squalane for shine and frizz control.",
    targetUser: "All hair types wanting lightweight shine",
    ingredients: ["Moringa Oil", "Squalane", "Bamboo Extract"],
    attributes: { shine: 88, frizzControl: true, vegan: true },
    slug: "verb-ghost-oil",
  },

  // ---------- BEAUTY ----------
  {
    id: "charlotte-pillow-talk", brandId: "charlotte-tilbury", brandName: "Charlotte Tilbury", name: "Matte Revolution Lipstick in Pillow Talk",
    category: "beauty", subcategory: "Lipstick", price: 38, image: "/products/ct-pillow-talk.jpg",
    rating: 4.9, reviewCount: 67800, isOriginal: true,
    description: "The iconic universal nude-pink lipstick beloved by celebrities worldwide.",
    targetUser: "All skin tones seeking the perfect nude-pink",
    attributes: { finish: "Matte", longevity: "8h", moisturizing: true },
    slug: "charlotte-tilbury-pillow-talk-lipstick",
  },
  {
    id: "nyx-butter", brandId: "nyx", brandName: "NYX", name: "Butter Gloss in Praline",
    category: "beauty", subcategory: "Lip Gloss", price: 8, image: "/products/nyx-butter.jpg",
    rating: 4.6, reviewCount: 31200,
    description: "Creamy, non-sticky gloss in a perfect Pillow Talk dupe shade.",
    targetUser: "Budget-conscious beauty lovers",
    attributes: { finish: "Glossy", longevity: "4h", moisturizing: true },
    slug: "nyx-butter-gloss-praline",
  },
  {
    id: "la-mer-creme", brandId: "la-mer", brandName: "La Mer", name: "Crème de la Mer",
    category: "beauty", subcategory: "Moisturizer", price: 395, image: "/products/la-mer-creme.jpg",
    rating: 4.7, reviewCount: 23100, isOriginal: true,
    description: "The legendary luxury moisturizer infused with Miracle Broth™ for transformative results.",
    targetUser: "Dry, sensitive, or maturing skin",
    ingredients: ["Miracle Broth™", "Seaweed Extract", "Lime Tea", "Glycerin"],
    attributes: { hydration: 98, luxuryLevel: "Ultra", spf: false },
    slug: "la-mer-creme-de-la-mer",
  },
  {
    id: "cerave-moisturizer", brandId: "cerave", brandName: "CeraVe", name: "Moisturizing Cream",
    category: "beauty", subcategory: "Moisturizer", price: 19, image: "/products/cerave-cream.jpg",
    rating: 4.8, reviewCount: 89400,
    description: "Dermatologist-developed moisturizer with ceramides and hyaluronic acid.",
    targetUser: "All skin types, especially dry or eczema-prone",
    ingredients: ["Ceramide NP", "Ceramide AP", "Hyaluronic Acid", "Glycerin"],
    attributes: { hydration: 91, luxuryLevel: "Budget", spf: false },
    slug: "cerave-moisturizing-cream",
  },
  {
    id: "ct-magic-cream", brandId: "charlotte-tilbury", brandName: "Charlotte Tilbury", name: "Magic Cream Moisturizer",
    category: "beauty", subcategory: "Moisturizer", price: 100, image: "/products/ct-magic-cream.jpg",
    rating: 4.6, reviewCount: 14600, isOriginal: true,
    description: "Cult-favorite hydrating moisturizer that plumps and primes skin for makeup.",
    targetUser: "Dull, dehydrated skin wanting glow",
    ingredients: ["Hyaluronic Acid", "Vitamin C", "Vitamin E", "Shea Butter"],
    attributes: { hydration: 90, luxuryLevel: "High", spf: false },
    slug: "charlotte-tilbury-magic-cream",
  },
  {
    id: "nivea-soft", brandId: "nivea", brandName: "Nivea", name: "Soft Moisturizing Crème",
    category: "beauty", subcategory: "Moisturizer", price: 8, image: "/products/nivea-soft.jpg",
    rating: 4.7, reviewCount: 42800,
    description: "Lightweight all-purpose moisturizer with jojoba oil and vitamin E.",
    targetUser: "All skin types wanting affordable hydration",
    ingredients: ["Jojoba Oil", "Vitamin E", "Glycerin"],
    attributes: { hydration: 84, luxuryLevel: "Budget", spf: false },
    slug: "nivea-soft-moisturizing-creme",
  },
  {
    id: "estee-anr", brandId: "estee-lauder", brandName: "Estée Lauder", name: "Advanced Night Repair Serum",
    category: "beauty", subcategory: "Serum", price: 78, image: "/products/estee-anr.jpg",
    rating: 4.7, reviewCount: 38900, isOriginal: true,
    description: "Iconic overnight repair serum with hyaluronic acid for radiant, even skin.",
    targetUser: "All skin types focused on anti-aging & repair",
    ingredients: ["Hyaluronic Acid", "Bifida Ferment Lysate", "Squalane"],
    attributes: { hydration: 93, antiAging: true, spf: false },
    slug: "estee-lauder-advanced-night-repair",
  },
  {
    id: "inkey-bakuchiol", brandId: "the-inkey-list", brandName: "The INKEY List", name: "Bakuchiol Retinol Alternative",
    category: "beauty", subcategory: "Serum", price: 15, image: "/products/inkey-bakuchiol.jpg",
    rating: 4.4, reviewCount: 6200,
    description: "Gentle plant-based retinol alternative that smooths and firms without irritation.",
    targetUser: "Sensitive skin wanting anti-aging benefits",
    ingredients: ["Bakuchiol", "Squalane", "Hyaluronic Acid"],
    attributes: { hydration: 80, antiAging: true, spf: false },
    slug: "inkey-list-bakuchiol",
  },
  {
    id: "drunk-elephant-cfirma", brandId: "drunk-elephant", brandName: "Drunk Elephant", name: "C-Firma Fresh Day Serum",
    category: "beauty", subcategory: "Serum", price: 78, image: "/products/de-cfirma.jpg",
    rating: 4.3, reviewCount: 9100, isOriginal: true,
    description: "Potent vitamin C day serum that firms, brightens, and improves signs of photo-aging.",
    targetUser: "Dull skin wanting brightening & firming",
    ingredients: ["15% L-Ascorbic Acid", "Ferulic Acid", "Vitamin E"],
    attributes: { brightening: true, antiAging: true, spf: false },
    slug: "drunk-elephant-c-firma",
  },
  {
    id: "ordinary-vitc", brandId: "the-ordinary", brandName: "The Ordinary", name: "Vitamin C Suspension 23% + HA Spheres 2%",
    category: "beauty", subcategory: "Serum", price: 12, image: "/products/ordinary-vitc.jpg",
    rating: 4.2, reviewCount: 21400,
    description: "High-strength vitamin C serum for brightening at a fraction of the cost.",
    targetUser: "Brightening seekers on a budget",
    ingredients: ["23% L-Ascorbic Acid", "Hyaluronic Acid Spheres"],
    attributes: { brightening: true, antiAging: true, spf: false },
    slug: "the-ordinary-vitamin-c-suspension",
  },
  {
    id: "dior-lip-glow", brandId: "dior", brandName: "Dior", name: "Addict Lip Glow Oil",
    category: "beauty", subcategory: "Lip Oil", price: 40, image: "/products/dior-lip-glow.jpg",
    rating: 4.8, reviewCount: 28700, isOriginal: true,
    description: "Cult lip oil that nourishes and gives a custom flush of color with cherry oil.",
    targetUser: "Anyone wanting glossy, hydrated, tinted lips",
    ingredients: ["Cherry Oil", "Jojoba Oil", "Vitamin E"],
    attributes: { finish: "Glossy", moisturizing: true, tinted: true },
    slug: "dior-addict-lip-glow-oil",
  },
  {
    id: "elf-lip-oil", brandId: "elf", brandName: "e.l.f. Cosmetics", name: "Glow Reviver Lip Oil",
    category: "beauty", subcategory: "Lip Oil", price: 8, image: "/products/elf-lip-oil.jpg",
    rating: 4.5, reviewCount: 15800,
    description: "Nourishing tinted lip oil — a beloved Dior Lip Glow dupe.",
    targetUser: "Glossy-lip lovers on a budget",
    ingredients: ["Jojoba Oil", "Squalane", "Vitamin E"],
    attributes: { finish: "Glossy", moisturizing: true, tinted: true },
    slug: "elf-glow-reviver-lip-oil",
  },
  {
    id: "tatcha-dewy", brandId: "tatcha", brandName: "Tatcha", name: "The Dewy Skin Cream",
    category: "beauty", subcategory: "Moisturizer", price: 72, image: "/products/tatcha-dewy.jpg",
    rating: 4.5, reviewCount: 11200, isOriginal: true,
    description: "Rich plumping cream with Japanese purple rice and Okinawa algae for a dewy glow.",
    targetUser: "Dry, dull skin wanting luminous hydration",
    ingredients: ["Okinawa Red Algae", "Japanese Purple Rice", "Hyaluronic Acid"],
    attributes: { hydration: 94, luxuryLevel: "High", spf: false },
    slug: "tatcha-dewy-skin-cream",
  },
  {
    id: "boj-rice", brandId: "beauty-of-joseon", brandName: "Beauty of Joseon", name: "Dynasty Cream",
    category: "beauty", subcategory: "Moisturizer", price: 18, image: "/products/boj-dynasty.jpg",
    rating: 4.6, reviewCount: 13400,
    description: "K-beauty rice and niacinamide cream for deep, dewy hydration.",
    targetUser: "Dry skin wanting glow at low cost",
    ingredients: ["Rice Bran Water", "Niacinamide", "Ginseng"],
    attributes: { hydration: 90, luxuryLevel: "Budget", spf: false },
    slug: "beauty-of-joseon-dynasty-cream",
  },

  // ---------- JEWELRY ----------
  {
    id: "cartier-love", brandId: "cartier", brandName: "Cartier", name: "Love Bracelet",
    category: "jewelry", subcategory: "Bracelet", price: 6900, image: "/products/cartier-love.jpg",
    rating: 4.9, reviewCount: 4200, isOriginal: true,
    description: "The iconic yellow gold Love bracelet — a symbol of eternal commitment.",
    targetUser: "Luxury jewelry connoisseurs",
    attributes: { metal: "18k Yellow Gold", style: "Iconic", occasion: "Everyday/Gift" },
    slug: "cartier-love-bracelet",
  },
  {
    id: "missoma-cuff", brandId: "missoma", brandName: "Missoma", name: "Screw Bangle Cuff",
    category: "jewelry", subcategory: "Bracelet", price: 145, image: "/products/missoma-cuff.jpg",
    rating: 4.6, reviewCount: 3100,
    description: "Demi-fine Love-inspired cuff in 18k gold-plated recycled silver.",
    targetUser: "Contemporary jewelry lovers, Love dupe seekers",
    attributes: { metal: "18k Gold Plated Silver", style: "Modern", occasion: "Everyday" },
    slug: "missoma-screw-bangle-cuff",
  },
  {
    id: "mejuri-bangle", brandId: "mejuri", brandName: "Mejuri", name: "Gold Vermeil Bold Cuff",
    category: "jewelry", subcategory: "Bracelet", price: 78, image: "/products/mejuri-cuff.jpg",
    rating: 4.5, reviewCount: 2800,
    description: "Minimalist gold cuff with clean architectural lines.",
    targetUser: "Minimalist style, everyday luxury",
    attributes: { metal: "14k Gold Vermeil", style: "Minimal", occasion: "Everyday" },
    slug: "mejuri-gold-vermeil-bold-cuff",
  },
  {
    id: "vca-alhambra", brandId: "vancleef", brandName: "Van Cleef & Arpels", name: "Vintage Alhambra Pendant",
    category: "jewelry", subcategory: "Necklace", price: 3500, image: "/products/vca-alhambra.jpg",
    rating: 4.9, reviewCount: 1900, isOriginal: true,
    description: "The legendary four-leaf clover motif pendant in 18k gold and mother-of-pearl.",
    targetUser: "Luxury collectors, quiet luxury devotees",
    attributes: { metal: "18k Yellow Gold", style: "Clover", occasion: "Everyday/Gift" },
    slug: "van-cleef-vintage-alhambra-pendant",
  },
  {
    id: "mejuri-clover", brandId: "mejuri", brandName: "Mejuri", name: "Clover Pendant Necklace",
    category: "jewelry", subcategory: "Necklace", price: 120, image: "/products/mejuri-clover.jpg",
    rating: 4.5, reviewCount: 2100,
    description: "Delicate clover-motif pendant in 14k gold vermeil — an Alhambra-inspired pick.",
    targetUser: "Quiet luxury lovers, Alhambra dupe seekers",
    attributes: { metal: "14k Gold Vermeil", style: "Clover", occasion: "Everyday" },
    slug: "mejuri-clover-pendant-necklace",
  },
  {
    id: "gorjana-clover", brandId: "gorjana", brandName: "Gorjana", name: "Lou Charm Adjustable Necklace",
    category: "jewelry", subcategory: "Necklace", price: 65, image: "/products/gorjana-lou.jpg",
    rating: 4.4, reviewCount: 1600,
    description: "Dainty mother-of-pearl charm necklace with an adjustable 18k gold-plated chain.",
    targetUser: "Layering lovers on a budget",
    attributes: { metal: "18k Gold Plated", style: "Clover", occasion: "Everyday" },
    slug: "gorjana-lou-charm-necklace",
  },
  {
    id: "tiffany-t", brandId: "tiffany", brandName: "Tiffany & Co.", name: "Tiffany T Wire Bracelet",
    category: "jewelry", subcategory: "Bracelet", price: 2100, image: "/products/tiffany-t.jpg",
    rating: 4.8, reviewCount: 1400, isOriginal: true,
    description: "Modern minimalist 18k gold wire bracelet with the signature T motif.",
    targetUser: "Modern luxury minimalists",
    attributes: { metal: "18k Gold", style: "Minimal", occasion: "Everyday/Gift" },
    slug: "tiffany-t-wire-bracelet",
  },
  {
    id: "gorjana-bangle", brandId: "gorjana", brandName: "Gorjana", name: "Taner Bar Cuff",
    category: "jewelry", subcategory: "Bracelet", price: 60, image: "/products/gorjana-taner.jpg",
    rating: 4.4, reviewCount: 1300,
    description: "Sleek minimalist bar cuff in 18k gold plating — a Tiffany T-inspired look.",
    targetUser: "Minimalists wanting affordable luxe",
    attributes: { metal: "18k Gold Plated", style: "Minimal", occasion: "Everyday" },
    slug: "gorjana-taner-bar-cuff",
  },
  ...EXTRA_PRODUCTS,
  ...EXTRA2_PRODUCTS,
];

// ── RETAILERS ──────────────────────────────────────────────────
export const RETAILERS: Retailer[] = [
  { id: "amazon", name: "Amazon", homepage: "https://www.amazon.com", network: "amazon" },
  { id: "sephora", name: "Sephora", homepage: "https://www.sephora.com", network: "skimlinks" },
  { id: "ulta", name: "Ulta Beauty", homepage: "https://www.ulta.com", network: "skimlinks" },
  { id: "target", name: "Target", homepage: "https://www.target.com", network: "skimlinks" },
  { id: "nordstrom", name: "Nordstrom", homepage: "https://www.nordstrom.com", network: "skimlinks" },
  { id: "missoma", name: "Missoma", homepage: "https://www.missoma.com", network: "direct" },
  { id: "mejuri", name: "Mejuri", homepage: "https://www.mejuri.com", network: "direct" },
  { id: "brand-direct", name: "Brand Site", homepage: "", network: "direct" },
];

// ── OFFERS (compact spec → expanded below) ─────────────────────
// One product can have several retailer offers. URLs are real search/landing
// URLs; buildAffiliateUrl() wraps them with the Amazon tag / Skimlinks at
// ingestion (or at fallback render time).
const OFFER_SPECS: Record<string, OfferSpec[]> = {
  ...EXTRA_OFFER_SPECS,
  ...EXTRA2_OFFER_SPECS,
  "olaplex-3": [
    { retailerId: "amazon", url: "https://www.amazon.com/s?k=Olaplex+No+3+Hair+Perfector", price: 30 },
    { retailerId: "sephora", url: "https://www.sephora.com/search?keyword=olaplex%20no%203", price: 30 },
    { retailerId: "ulta", url: "https://www.ulta.com/shop/search?Ntt=olaplex%20no%203", price: 30 },
  ],
  "k18-mask": [
    { retailerId: "amazon", url: "https://www.amazon.com/s?k=K18+Leave-In+Molecular+Repair+Hair+Mask", price: 75 },
    { retailerId: "sephora", url: "https://www.sephora.com/search?keyword=k18%20mask", price: 75 },
  ],
  "loreal-bond-repair": [
    { retailerId: "amazon", url: "https://www.amazon.com/s?k=LOreal+EverPure+Bond+Repair+Serum", price: 12 },
    { retailerId: "target", url: "https://www.target.com/s?searchTerm=loreal+everpure+bond+repair", price: 12 },
  ],
  "redken-acidic": [
    { retailerId: "amazon", url: "https://www.amazon.com/s?k=Redken+Acidic+Bonding+Concentrate", price: 39 },
    { retailerId: "ulta", url: "https://www.ulta.com/shop/search?Ntt=redken%20acidic%20bonding", price: 39 },
  ],
  "kerastase-genesis": [
    { retailerId: "amazon", url: "https://www.amazon.com/s?k=Kerastase+Genesis+Serum", price: 56 },
    { retailerId: "sephora", url: "https://www.sephora.com/search?keyword=kerastase%20genesis", price: 56 },
  ],
  "living-proof-full": [
    { retailerId: "sephora", url: "https://www.sephora.com/search?keyword=living%20proof%20full%20shampoo", price: 32 },
    { retailerId: "amazon", url: "https://www.amazon.com/s?k=Living+Proof+Full+Shampoo", price: 32 },
  ],
  "verb-ghost-oil": [
    { retailerId: "amazon", url: "https://www.amazon.com/s?k=Verb+Ghost+Oil", price: 20 },
    { retailerId: "ulta", url: "https://www.ulta.com/shop/search?Ntt=verb%20ghost%20oil", price: 20 },
  ],
  "charlotte-pillow-talk": [
    { retailerId: "sephora", url: "https://www.sephora.com/search?keyword=charlotte%20tilbury%20pillow%20talk", price: 38 },
    { retailerId: "nordstrom", url: "https://www.nordstrom.com/sr?keyword=charlotte%20tilbury%20pillow%20talk", price: 38 },
  ],
  "nyx-butter": [
    { retailerId: "amazon", url: "https://www.amazon.com/s?k=NYX+Butter+Gloss+Praline", price: 8 },
    { retailerId: "target", url: "https://www.target.com/s?searchTerm=nyx+butter+gloss+praline", price: 6 },
    { retailerId: "ulta", url: "https://www.ulta.com/shop/search?Ntt=nyx%20butter%20gloss%20praline", price: 6 },
  ],
  "la-mer-creme": [
    { retailerId: "sephora", url: "https://www.sephora.com/search?keyword=creme%20de%20la%20mer", price: 395 },
    { retailerId: "nordstrom", url: "https://www.nordstrom.com/sr?keyword=la%20mer%20creme", price: 395 },
  ],
  "cerave-moisturizer": [
    { retailerId: "amazon", url: "https://www.amazon.com/s?k=CeraVe+Moisturizing+Cream", price: 19 },
    { retailerId: "target", url: "https://www.target.com/s?searchTerm=cerave+moisturizing+cream", price: 17 },
    { retailerId: "ulta", url: "https://www.ulta.com/shop/search?Ntt=cerave%20moisturizing%20cream", price: 18 },
  ],
  "ct-magic-cream": [
    { retailerId: "sephora", url: "https://www.sephora.com/search?keyword=charlotte%20tilbury%20magic%20cream", price: 100 },
  ],
  "nivea-soft": [
    { retailerId: "amazon", url: "https://www.amazon.com/s?k=Nivea+Soft+Moisturizing+Creme", price: 8 },
    { retailerId: "target", url: "https://www.target.com/s?searchTerm=nivea+soft+creme", price: 7 },
  ],
  "estee-anr": [
    { retailerId: "sephora", url: "https://www.sephora.com/search?keyword=advanced%20night%20repair", price: 78 },
    { retailerId: "nordstrom", url: "https://www.nordstrom.com/sr?keyword=estee%20lauder%20advanced%20night%20repair", price: 78 },
  ],
  "inkey-bakuchiol": [
    { retailerId: "sephora", url: "https://www.sephora.com/search?keyword=inkey%20list%20bakuchiol", price: 15 },
    { retailerId: "amazon", url: "https://www.amazon.com/s?k=INKEY+List+Bakuchiol", price: 15 },
  ],
  "drunk-elephant-cfirma": [
    { retailerId: "sephora", url: "https://www.sephora.com/search?keyword=drunk%20elephant%20c-firma", price: 78 },
  ],
  "ordinary-vitc": [
    { retailerId: "sephora", url: "https://www.sephora.com/search?keyword=the%20ordinary%20vitamin%20c%20suspension", price: 12 },
    { retailerId: "ulta", url: "https://www.ulta.com/shop/search?Ntt=the%20ordinary%20vitamin%20c", price: 12 },
  ],
  "dior-lip-glow": [
    { retailerId: "sephora", url: "https://www.sephora.com/search?keyword=dior%20lip%20glow%20oil", price: 40 },
    { retailerId: "nordstrom", url: "https://www.nordstrom.com/sr?keyword=dior%20addict%20lip%20glow%20oil", price: 40 },
  ],
  "elf-lip-oil": [
    { retailerId: "target", url: "https://www.target.com/s?searchTerm=elf+glow+reviver+lip+oil", price: 8 },
    { retailerId: "amazon", url: "https://www.amazon.com/s?k=elf+Glow+Reviver+Lip+Oil", price: 8 },
  ],
  "tatcha-dewy": [
    { retailerId: "sephora", url: "https://www.sephora.com/search?keyword=tatcha%20dewy%20skin%20cream", price: 72 },
  ],
  "boj-rice": [
    { retailerId: "amazon", url: "https://www.amazon.com/s?k=Beauty+of+Joseon+Dynasty+Cream", price: 18 },
  ],
  "cartier-love": [
    { retailerId: "amazon", url: "https://www.amazon.com/s?k=Cartier+Love+Bracelet", price: 6900 },
  ],
  "missoma-cuff": [
    { retailerId: "missoma", url: "https://www.missoma.com/products/gold-screw-bangle", price: 145 },
  ],
  "mejuri-bangle": [
    { retailerId: "mejuri", url: "https://www.mejuri.com/shop/products/bold-cuff", price: 78 },
  ],
  "vca-alhambra": [
    { retailerId: "amazon", url: "https://www.amazon.com/s?k=Van+Cleef+Alhambra+Pendant", price: 3500 },
  ],
  "mejuri-clover": [
    { retailerId: "mejuri", url: "https://www.mejuri.com/shop/products/clover-pendant", price: 120 },
  ],
  "gorjana-clover": [
    { retailerId: "amazon", url: "https://www.amazon.com/s?k=Gorjana+Lou+Charm+Necklace", price: 65 },
  ],
  "tiffany-t": [
    { retailerId: "amazon", url: "https://www.amazon.com/s?k=Tiffany+T+Wire+Bracelet", price: 2100 },
  ],
  "gorjana-bangle": [
    { retailerId: "amazon", url: "https://www.amazon.com/s?k=Gorjana+Taner+Bar+Cuff", price: 60 },
  ],
};

/** Expanded raw offers (affiliateUrl built lazily in affiliate.ts / ingestion). */
export const OFFERS: Offer[] = Object.entries(OFFER_SPECS).flatMap(([productId, specs]) =>
  specs.map((spec) => {
    const retailer = RETAILERS.find((r) => r.id === spec.retailerId)!;
    return {
      id: `${productId}__${spec.retailerId}`,
      productId,
      retailerId: spec.retailerId,
      retailerName: retailer.name,
      network: retailer.network,
      rawUrl: spec.url,
      affiliateUrl: spec.url, // overwritten by buildAffiliateUrl() where applicable
      price: spec.price,
      currency: "USD",
      inStock: true,
    };
  })
);

// ── DUPE RELATIONSHIPS (manual seed; engine recomputes later) ──
export const ALTERNATIVES: Record<string, Alternative[]> = {
  ...EXTRA_ALTERNATIVES,
  ...EXTRA2_ALTERNATIVES,
  "olaplex-3": [
    { productId: "k18-mask", matchScore: 94, dupeLevel: "premium", reason: "Superior bond repair technology, faster results" },
    { productId: "redken-acidic", matchScore: 87, dupeLevel: "similar", reason: "Same bond-building active, salon quality" },
    { productId: "loreal-bond-repair", matchScore: 82, dupeLevel: "budget", reason: "Identical active ingredient at a fraction of the price" },
  ],
  "kerastase-genesis": [
    { productId: "redken-acidic", matchScore: 81, dupeLevel: "similar", reason: "Comparable strengthening treatment, salon brand" },
    { productId: "verb-ghost-oil", matchScore: 76, dupeLevel: "budget", reason: "Adds shine and reduces breakage at a third of the price" },
  ],
  "living-proof-full": [
    { productId: "verb-ghost-oil", matchScore: 78, dupeLevel: "budget", reason: "Lightweight, volumizing-friendly, vegan formula" },
  ],
  "charlotte-pillow-talk": [
    { productId: "nyx-butter", matchScore: 88, dupeLevel: "budget", reason: "Near-identical nude-pink shade, comfortable wear" },
  ],
  "la-mer-creme": [
    { productId: "tatcha-dewy", matchScore: 86, dupeLevel: "premium", reason: "Luxurious dewy hydration with botanical actives" },
    { productId: "cerave-moisturizer", matchScore: 82, dupeLevel: "budget", reason: "Science-backed ceramides, dermatologist preferred, 20x cheaper" },
  ],
  "ct-magic-cream": [
    { productId: "boj-rice", matchScore: 84, dupeLevel: "budget", reason: "Plumping, glow-giving hydration at a fraction of the price" },
    { productId: "cerave-moisturizer", matchScore: 79, dupeLevel: "budget", reason: "Ceramide-rich hydration for a primed base" },
  ],
  "estee-anr": [
    { productId: "inkey-bakuchiol", matchScore: 80, dupeLevel: "budget", reason: "Gentle anti-aging repair with hyaluronic acid" },
    { productId: "ordinary-vitc", matchScore: 76, dupeLevel: "budget", reason: "Brightening, repair-focused serum on a budget" },
  ],
  "drunk-elephant-cfirma": [
    { productId: "ordinary-vitc", matchScore: 89, dupeLevel: "budget", reason: "High-strength L-ascorbic acid vitamin C, 6x cheaper" },
  ],
  "tatcha-dewy": [
    { productId: "boj-rice", matchScore: 88, dupeLevel: "budget", reason: "Rice-based dewy hydration, K-beauty cult favorite" },
  ],
  "dior-lip-glow": [
    { productId: "elf-lip-oil", matchScore: 90, dupeLevel: "budget", reason: "Tinted, nourishing glossy finish — the classic dupe" },
  ],
  "cartier-love": [
    { productId: "missoma-cuff", matchScore: 91, dupeLevel: "similar", reason: "Same screw motif, premium recycled silver, ethical brand" },
    { productId: "mejuri-bangle", matchScore: 84, dupeLevel: "budget", reason: "Minimalist aesthetic, real gold vermeil, fine jewelry quality" },
  ],
  "vca-alhambra": [
    { productId: "mejuri-clover", matchScore: 89, dupeLevel: "similar", reason: "Clover motif in 14k gold vermeil, fine jewelry quality" },
    { productId: "gorjana-clover", matchScore: 82, dupeLevel: "budget", reason: "Mother-of-pearl clover charm at an accessible price" },
  ],
  "tiffany-t": [
    { productId: "gorjana-bangle", matchScore: 85, dupeLevel: "budget", reason: "Sleek minimalist bar cuff, same modern aesthetic" },
    { productId: "mejuri-bangle", matchScore: 81, dupeLevel: "budget", reason: "Clean architectural gold cuff, everyday luxe" },
  ],
};

// ── UI CONSTANTS ───────────────────────────────────────────────
export const CATEGORIES = [
  {
    slug: "beauty", label: "Beauty", icon: "✦", description: "Skincare, makeup, and fragrance",
    subcategories: ["Moisturizer", "Serum", "Essence", "Cleanser", "Exfoliant", "Sunscreen", "Foundation", "Concealer", "Setting Spray", "Setting Powder", "Blush", "Bronzer", "Brow", "Lipstick", "Lip Oil", "Lip Gloss", "Mascara"],
    color: "#c9617a", bgColor: "#f5dde3",
  },
  {
    slug: "hair", label: "Hair Care", icon: "◈", description: "Treatments, styling, and repair",
    subcategories: ["Shampoo", "Conditioner", "Treatment", "Mask", "Oil", "Styling", "Dry Shampoo", "Styling Tool"],
    color: "#9e7a2a", bgColor: "#f5ead4",
  },
  {
    slug: "jewelry", label: "Jewelry", icon: "◇", description: "Fine and demi-fine jewelry",
    subcategories: ["Bracelet", "Necklace", "Ring", "Earrings", "Watch"],
    color: "#5b21b6", bgColor: "#ede9fe",
  },
];

export const POPULAR_SEARCHES = [
  "Olaplex dupes",
  "La Mer alternatives",
  "Cartier Love dupe",
  "Charlotte Tilbury Pillow Talk",
  "Dior Lip Glow dupe",
  "Van Cleef Alhambra alternative",
  "Best vitamin C serum under $15",
  "Luxury jewelry under $200",
];

export const TRENDING_PRODUCTS = [
  "olaplex-3",
  "charlotte-pillow-talk",
  "cartier-love",
  "la-mer-creme",
  "dior-lip-glow",
  "vca-alhambra",
];
