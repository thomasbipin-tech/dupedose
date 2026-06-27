// ────────────────────────────────────────────────────────────
// The editorial backbone of the real-data catalog. Each "intent" is a
// hero/original product people search dupes for. The build pipeline
// (scripts/build-catalog.ts) searches the original + a discovery query,
// then Claude picks & scores genuine dupes from the real results.
//
// To grow the catalog, add intents here. Keep it balanced across
// beauty / hair / jewelry, with a fragrance set and viral/budget picks.
// ────────────────────────────────────────────────────────────

import type { Category } from "../types";

export interface DupeIntent {
  originalQuery: string;   // search that finds the original product
  discoveryQuery: string;  // search that surfaces varied alternative brands
  category: Category;
  subcategory: string;
  tags?: string[];         // "viral" | "tiktok" | "budget" | "fragrance" | "luxury"
}

export const INTENTS: DupeIntent[] = [
  // ===== BEAUTY — skincare =====
  { originalQuery: "La Mer Crème de la Mer moisturizer", discoveryQuery: "rich ceramide moisturizer cream", category: "beauty", subcategory: "Moisturizer", tags: ["luxury"] },
  { originalQuery: "Charlotte Tilbury Magic Cream", discoveryQuery: "hydrating glow face moisturizer", category: "beauty", subcategory: "Moisturizer", tags: ["luxury"] },
  { originalQuery: "Drunk Elephant Protini Polypeptide Cream", discoveryQuery: "peptide firming face cream", category: "beauty", subcategory: "Moisturizer" },
  { originalQuery: "SkinCeuticals CE Ferulic vitamin C serum", discoveryQuery: "vitamin c ferulic acid serum", category: "beauty", subcategory: "Serum" },
  { originalQuery: "Estee Lauder Advanced Night Repair serum", discoveryQuery: "hyaluronic repair night serum", category: "beauty", subcategory: "Serum" },
  { originalQuery: "Sunday Riley Good Genes lactic acid", discoveryQuery: "lactic acid exfoliating treatment", category: "beauty", subcategory: "Serum" },
  { originalQuery: "SK-II Facial Treatment Essence", discoveryQuery: "galactomyces ferment essence", category: "beauty", subcategory: "Essence", tags: ["luxury"] },
  { originalQuery: "Supergoop Glowscreen SPF 40", discoveryQuery: "glow sunscreen primer SPF", category: "beauty", subcategory: "Sunscreen", tags: ["viral"] },
  { originalQuery: "Farmacy Green Clean cleansing balm", discoveryQuery: "makeup removing cleansing balm", category: "beauty", subcategory: "Cleanser" },
  { originalQuery: "Laneige Lip Sleeping Mask", discoveryQuery: "overnight lip mask balm", category: "beauty", subcategory: "Lip Treatment", tags: ["viral"] },

  // ===== BEAUTY — makeup =====
  { originalQuery: "Charlotte Tilbury Pillow Talk lipstick", discoveryQuery: "nude pink matte lipstick", category: "beauty", subcategory: "Lipstick", tags: ["viral"] },
  { originalQuery: "Charlotte Tilbury Hollywood Flawless Filter", discoveryQuery: "liquid glow complexion booster", category: "beauty", subcategory: "Complexion", tags: ["viral"] },
  { originalQuery: "NARS Radiant Creamy Concealer", discoveryQuery: "full coverage radiant concealer", category: "beauty", subcategory: "Concealer" },
  { originalQuery: "Tarte Shape Tape concealer", discoveryQuery: "full coverage matte concealer", category: "beauty", subcategory: "Concealer", tags: ["viral"] },
  { originalQuery: "Benefit Hoola matte bronzer", discoveryQuery: "matte powder bronzer", category: "beauty", subcategory: "Bronzer" },
  { originalQuery: "Anastasia Beverly Hills Dipbrow Pomade", discoveryQuery: "waterproof brow pomade", category: "beauty", subcategory: "Brow" },
  { originalQuery: "Too Faced Better Than Sex mascara", discoveryQuery: "volumizing dramatic mascara", category: "beauty", subcategory: "Mascara" },
  { originalQuery: "Rare Beauty Soft Pinch liquid blush", discoveryQuery: "pigmented liquid blush", category: "beauty", subcategory: "Blush", tags: ["viral"] },
  { originalQuery: "Fenty Beauty Gloss Bomb lip luminizer", discoveryQuery: "high shine lip gloss", category: "beauty", subcategory: "Lip Gloss" },
  { originalQuery: "Dior Addict Lip Glow Oil", discoveryQuery: "tinted hydrating lip oil", category: "beauty", subcategory: "Lip Oil", tags: ["viral"] },
  { originalQuery: "Urban Decay All Nighter setting spray", discoveryQuery: "long lasting makeup setting spray", category: "beauty", subcategory: "Setting Spray" },
  { originalQuery: "Laura Mercier translucent setting powder", discoveryQuery: "translucent loose setting powder", category: "beauty", subcategory: "Setting Powder" },
  { originalQuery: "Fenty Beauty Pro Filt'r foundation", discoveryQuery: "soft matte longwear foundation", category: "beauty", subcategory: "Foundation" },
  { originalQuery: "MAC Velvet Teddy lipstick", discoveryQuery: "beige nude matte lipstick", category: "beauty", subcategory: "Lipstick" },

  // ===== BEAUTY — fragrance =====
  { originalQuery: "Baccarat Rouge 540 eau de parfum", discoveryQuery: "amber saffron perfume long lasting", category: "beauty", subcategory: "Fragrance", tags: ["fragrance", "luxury"] },
  { originalQuery: "YSL Black Opium eau de parfum", discoveryQuery: "sweet coffee vanilla perfume women", category: "beauty", subcategory: "Fragrance", tags: ["fragrance"] },
  { originalQuery: "Chanel Coco Mademoiselle perfume", discoveryQuery: "elegant citrus floral perfume women", category: "beauty", subcategory: "Fragrance", tags: ["fragrance", "luxury"] },
  { originalQuery: "Dior Sauvage eau de toilette", discoveryQuery: "fresh spicy mens cologne", category: "beauty", subcategory: "Fragrance", tags: ["fragrance"] },
  { originalQuery: "Tom Ford Lost Cherry perfume", discoveryQuery: "black cherry almond perfume", category: "beauty", subcategory: "Fragrance", tags: ["fragrance", "luxury"] },

  // ===== HAIR =====
  { originalQuery: "Olaplex No 3 Hair Perfector", discoveryQuery: "hair bond repair treatment", category: "hair", subcategory: "Treatment", tags: ["viral"] },
  { originalQuery: "K18 leave-in molecular repair hair mask", discoveryQuery: "leave in hair repair mask damaged", category: "hair", subcategory: "Treatment", tags: ["viral"] },
  { originalQuery: "Moroccanoil Treatment oil", discoveryQuery: "argan hair oil shine frizz", category: "hair", subcategory: "Oil" },
  { originalQuery: "Olaplex No 4 bond maintenance shampoo", discoveryQuery: "bond repair shampoo damaged hair", category: "hair", subcategory: "Shampoo" },
  { originalQuery: "Living Proof PhD dry shampoo", discoveryQuery: "residue free dry shampoo", category: "hair", subcategory: "Dry Shampoo" },
  { originalQuery: "Briogeo Don't Despair Repair hair mask", discoveryQuery: "deep conditioning hair mask dry", category: "hair", subcategory: "Mask" },
  { originalQuery: "Gisou Honey Infused Hair Oil", discoveryQuery: "nourishing hair oil shine", category: "hair", subcategory: "Oil", tags: ["viral"] },
  { originalQuery: "Color Wow Dream Coat anti-frizz spray", discoveryQuery: "anti humidity smoothing hair spray", category: "hair", subcategory: "Styling", tags: ["viral"] },
  { originalQuery: "Olaplex No 4P purple toning shampoo", discoveryQuery: "purple shampoo blonde brass", category: "hair", subcategory: "Shampoo" },
  { originalQuery: "Dyson Airwrap multi styler", discoveryQuery: "multi styler air hair tool", category: "hair", subcategory: "Styling Tool", tags: ["viral", "luxury"] },

  // ===== JEWELRY =====
  { originalQuery: "Cartier Love bracelet gold", discoveryQuery: "gold screw bangle cuff bracelet", category: "jewelry", subcategory: "Bracelet", tags: ["luxury"] },
  { originalQuery: "Cartier Juste un Clou nail bracelet", discoveryQuery: "gold nail cuff bracelet", category: "jewelry", subcategory: "Bracelet", tags: ["luxury"] },
  { originalQuery: "Van Cleef Alhambra clover necklace", discoveryQuery: "gold clover pendant necklace mother of pearl", category: "jewelry", subcategory: "Necklace", tags: ["luxury"] },
  { originalQuery: "Tiffany T wire bracelet gold", discoveryQuery: "minimalist gold cuff bracelet", category: "jewelry", subcategory: "Bracelet", tags: ["luxury"] },
  { originalQuery: "Cartier Trinity ring three tone", discoveryQuery: "interlocking three tone gold ring", category: "jewelry", subcategory: "Ring", tags: ["luxury"] },
  { originalQuery: "Hermes Clic H enamel bracelet", discoveryQuery: "enamel gold bangle bracelet", category: "jewelry", subcategory: "Bracelet", tags: ["luxury"] },
  { originalQuery: "Jennifer Fisher chunky gold hoops", discoveryQuery: "chunky gold hoop earrings", category: "jewelry", subcategory: "Earrings" },
  { originalQuery: "diamond tennis necklace 14k", discoveryQuery: "cubic zirconia tennis necklace", category: "jewelry", subcategory: "Necklace", tags: ["budget"] },
];
