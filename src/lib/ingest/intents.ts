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

  // ===== EXPANSION — skincare =====
  { originalQuery: "Tatcha The Dewy Skin Cream", discoveryQuery: "dewy hydrating glow face cream", category: "beauty", subcategory: "Moisturizer", tags: ["luxury"] },
  { originalQuery: "Augustinus Bader The Rich Cream", discoveryQuery: "luxury anti aging rich face cream", category: "beauty", subcategory: "Moisturizer", tags: ["luxury"] },
  { originalQuery: "CeraVe Moisturizing Cream", discoveryQuery: "ceramide moisturizer dry skin", category: "beauty", subcategory: "Moisturizer", tags: ["budget"] },
  { originalQuery: "The Ordinary Niacinamide 10% Zinc", discoveryQuery: "niacinamide serum pores oil control", category: "beauty", subcategory: "Serum", tags: ["budget"] },
  { originalQuery: "Paula's Choice 10% Niacinamide Booster", discoveryQuery: "niacinamide brightening serum", category: "beauty", subcategory: "Serum" },
  { originalQuery: "Drunk Elephant C-Firma Fresh vitamin C", discoveryQuery: "vitamin c brightening serum", category: "beauty", subcategory: "Serum" },
  { originalQuery: "Sunday Riley Luna retinol sleeping oil", discoveryQuery: "retinol night face oil", category: "beauty", subcategory: "Face Oil" },
  { originalQuery: "Drunk Elephant Virgin Marula face oil", discoveryQuery: "facial oil dry skin", category: "beauty", subcategory: "Face Oil" },
  { originalQuery: "Lancome Advanced Genifique eye cream", discoveryQuery: "brightening eye cream dark circles", category: "beauty", subcategory: "Eye Cream" },
  { originalQuery: "Kiehl's Avocado eye cream", discoveryQuery: "hydrating eye cream", category: "beauty", subcategory: "Eye Cream" },
  { originalQuery: "Fresh Rose Deep Hydration toner", discoveryQuery: "hydrating facial toner", category: "beauty", subcategory: "Toner" },
  { originalQuery: "Drunk Elephant TLC Framboos glycolic serum", discoveryQuery: "glycolic acid exfoliating serum", category: "beauty", subcategory: "Exfoliant" },
  { originalQuery: "The INKEY List retinol serum", discoveryQuery: "retinol serum anti aging", category: "beauty", subcategory: "Serum", tags: ["budget"] },
  { originalQuery: "Tatcha The Rice Polish exfoliant", discoveryQuery: "exfoliating face powder cleanser", category: "beauty", subcategory: "Exfoliant" },
  { originalQuery: "Glow Recipe Watermelon Glow toner", discoveryQuery: "pha bha exfoliating toner", category: "beauty", subcategory: "Toner", tags: ["viral"] },
  { originalQuery: "Aztec Secret Indian Healing clay mask", discoveryQuery: "clay face mask pores", category: "beauty", subcategory: "Face Mask", tags: ["viral", "budget"] },
  { originalQuery: "Supergoop Unseen Sunscreen SPF 40", discoveryQuery: "invisible face sunscreen spf", category: "beauty", subcategory: "Sunscreen" },
  { originalQuery: "EltaMD UV Clear SPF 46", discoveryQuery: "face sunscreen sensitive skin spf", category: "beauty", subcategory: "Sunscreen" },

  // ===== EXPANSION — makeup =====
  { originalQuery: "Charlotte Tilbury Airbrush Flawless setting spray", discoveryQuery: "long lasting setting spray matte", category: "beauty", subcategory: "Setting Spray" },
  { originalQuery: "Milk Makeup Hydro Grip primer", discoveryQuery: "hydrating gripping makeup primer", category: "beauty", subcategory: "Primer", tags: ["viral"] },
  { originalQuery: "Smashbox Photo Finish primer", discoveryQuery: "pore blurring face primer", category: "beauty", subcategory: "Primer" },
  { originalQuery: "Urban Decay Naked eyeshadow palette", discoveryQuery: "neutral eyeshadow palette", category: "beauty", subcategory: "Eyeshadow Palette" },
  { originalQuery: "Anastasia Beverly Hills Soft Glam palette", discoveryQuery: "warm neutral eyeshadow palette", category: "beauty", subcategory: "Eyeshadow Palette" },
  { originalQuery: "Stila Stay All Day liquid eyeliner", discoveryQuery: "waterproof liquid eyeliner", category: "beauty", subcategory: "Eyeliner" },
  { originalQuery: "Charlotte Tilbury Beauty Light Wand highlighter", discoveryQuery: "liquid highlighter glow", category: "beauty", subcategory: "Highlighter", tags: ["viral"] },
  { originalQuery: "Rare Beauty Positive Light liquid highlighter", discoveryQuery: "dewy liquid highlighter", category: "beauty", subcategory: "Highlighter" },
  { originalQuery: "Charlotte Tilbury Beautiful Skin tinted moisturizer", discoveryQuery: "tinted moisturizer natural coverage", category: "beauty", subcategory: "Tinted Moisturizer" },
  { originalQuery: "Ilia Super Serum Skin Tint SPF", discoveryQuery: "skin tint serum foundation spf", category: "beauty", subcategory: "Tinted Moisturizer", tags: ["viral"] },
  { originalQuery: "Rare Beauty Stay Vulnerable cream blush", discoveryQuery: "cream blush dewy natural", category: "beauty", subcategory: "Cream Blush" },
  { originalQuery: "Charlotte Tilbury Lip Cheat liner", discoveryQuery: "nude lip liner pencil", category: "beauty", subcategory: "Lip Liner" },
  { originalQuery: "Benefit Gimme Brow volumizing gel", discoveryQuery: "tinted brow gel volumizing", category: "beauty", subcategory: "Brow" },
  { originalQuery: "Maybelline Sky High mascara", discoveryQuery: "lengthening volumizing mascara", category: "beauty", subcategory: "Mascara", tags: ["viral", "budget"] },

  // ===== EXPANSION — fragrance (designer → dupe; high search volume) =====
  { originalQuery: "Maison Francis Kurkdjian Baccarat Rouge 540", discoveryQuery: "amber saffron perfume long lasting", category: "beauty", subcategory: "Fragrance", tags: ["fragrance", "luxury"] },
  { originalQuery: "Creed Aventus eau de parfum men", discoveryQuery: "fruity smoky mens cologne long lasting", category: "beauty", subcategory: "Fragrance", tags: ["fragrance", "luxury"] },
  { originalQuery: "Le Labo Santal 33 eau de parfum", discoveryQuery: "sandalwood woody unisex perfume", category: "beauty", subcategory: "Fragrance", tags: ["fragrance", "luxury"] },
  { originalQuery: "Viktor Rolf Flowerbomb perfume", discoveryQuery: "sweet floral perfume women", category: "beauty", subcategory: "Fragrance", tags: ["fragrance"] },
  { originalQuery: "Carolina Herrera Good Girl perfume", discoveryQuery: "sweet tonka jasmine perfume women", category: "beauty", subcategory: "Fragrance", tags: ["fragrance"] },
  { originalQuery: "Lancome La Vie Est Belle perfume", discoveryQuery: "sweet iris gourmand perfume women", category: "beauty", subcategory: "Fragrance", tags: ["fragrance"] },
  { originalQuery: "Paco Rabanne 1 Million men cologne", discoveryQuery: "spicy sweet mens cologne", category: "beauty", subcategory: "Fragrance", tags: ["fragrance"] },
  { originalQuery: "Versace Eros men eau de toilette", discoveryQuery: "fresh mint vanilla mens cologne", category: "beauty", subcategory: "Fragrance", tags: ["fragrance"] },

  // ===== EXPANSION — hair =====
  { originalQuery: "Olaplex No 5 bond conditioner", discoveryQuery: "repair conditioner damaged hair", category: "hair", subcategory: "Conditioner" },
  { originalQuery: "Adwoa Beauty Baomint leave-in conditioner", discoveryQuery: "leave in conditioner curly hair", category: "hair", subcategory: "Leave-In" },
  { originalQuery: "Color Wow Dream Coat heat protectant", discoveryQuery: "heat protectant spray hair", category: "hair", subcategory: "Heat Protectant" },
  { originalQuery: "Bumble and bumble Hairdresser's Invisible Oil", discoveryQuery: "lightweight hair oil shine", category: "hair", subcategory: "Oil" },
  { originalQuery: "Ouai Wave Spray texturizing", discoveryQuery: "texturizing sea salt spray hair", category: "hair", subcategory: "Styling" },
  { originalQuery: "Living Proof Full dry volume blast", discoveryQuery: "volumizing texture hair spray", category: "hair", subcategory: "Styling" },
  { originalQuery: "DevaCurl SuperCream curl cream", discoveryQuery: "curl defining cream", category: "hair", subcategory: "Curl Cream" },
  { originalQuery: "GHD Platinum flat iron straightener", discoveryQuery: "ceramic flat iron hair straightener", category: "hair", subcategory: "Styling Tool", tags: ["luxury"] },
  { originalQuery: "T3 AireLuxe hair dryer", discoveryQuery: "ionic blow dryer", category: "hair", subcategory: "Styling Tool" },
  { originalQuery: "Mielle Rosemary Mint scalp oil", discoveryQuery: "rosemary scalp hair growth oil", category: "hair", subcategory: "Oil", tags: ["viral", "budget"] },

  // ===== EXPANSION — jewelry =====
  { originalQuery: "Mejuri diamond stud earrings", discoveryQuery: "gold diamond stud earrings", category: "jewelry", subcategory: "Earrings" },
  { originalQuery: "Mejuri small hoop huggie earrings gold", discoveryQuery: "gold huggie hoop earrings", category: "jewelry", subcategory: "Earrings" },
  { originalQuery: "Tennis bracelet diamond gold", discoveryQuery: "cubic zirconia tennis bracelet", category: "jewelry", subcategory: "Bracelet" },
  { originalQuery: "Mejuri Croissant Dome ring gold", discoveryQuery: "chunky gold dome ring", category: "jewelry", subcategory: "Ring" },
  { originalQuery: "signet ring gold engraved", discoveryQuery: "gold signet ring", category: "jewelry", subcategory: "Ring" },
  { originalQuery: "Mejuri pearl necklace gold", discoveryQuery: "freshwater pearl necklace", category: "jewelry", subcategory: "Necklace" },
  { originalQuery: "Cuban link chain necklace gold", discoveryQuery: "gold cuban link chain necklace", category: "jewelry", subcategory: "Necklace" },
  { originalQuery: "gold paperclip chain necklace", discoveryQuery: "paperclip link chain necklace gold", category: "jewelry", subcategory: "Necklace" },

  // ── DEMAND-DRIVEN (Jul 2026): gaps vs the top-10 most dupe-searched US
  // beauty brands (RetailBoss, Google data Nov 2025-2026) + viral funnels.
  { originalQuery: "Sol de Janeiro Brazilian Bum Bum Cream", discoveryQuery: "firming body cream vanilla scented", category: "beauty", subcategory: "Body Cream", tags: ["viral"] },
  { originalQuery: "Sol de Janeiro Cheirosa 62 perfume mist", discoveryQuery: "vanilla pistachio caramel body mist", category: "beauty", subcategory: "Fragrance", tags: ["viral", "fragrance"] },
  { originalQuery: "Drunk Elephant D-Bronzi Sunshine Drops", discoveryQuery: "bronzing drops liquid bronzer serum", category: "beauty", subcategory: "Bronzer", tags: ["viral"] },
  { originalQuery: "Glossier Cloud Paint blush", discoveryQuery: "gel cream blush seamless", category: "beauty", subcategory: "Cream Blush", tags: ["viral"] },
  { originalQuery: "Rhode Peptide Lip Treatment", discoveryQuery: "peptide lip treatment balm", category: "beauty", subcategory: "Lip Treatment", tags: ["viral", "tiktok"] },
  { originalQuery: "Summer Fridays Lip Butter Balm", discoveryQuery: "lip butter balm hydrating", category: "beauty", subcategory: "Lip Treatment", tags: ["viral", "tiktok"] },
  { originalQuery: "Estee Lauder Double Wear Stay-in-Place Foundation", discoveryQuery: "long wear full coverage matte foundation", category: "beauty", subcategory: "Foundation" },
  { originalQuery: "Giorgio Armani Luminous Silk Foundation", discoveryQuery: "luminous natural finish foundation", category: "beauty", subcategory: "Foundation", tags: ["luxury"] },
  { originalQuery: "Fenty Beauty Gloss Bomb Universal Lip Luminizer", discoveryQuery: "lip gloss luminizer shimmer", category: "beauty", subcategory: "Lip Gloss", tags: ["viral"] },
  { originalQuery: "Dior Backstage Rosy Glow Blush", discoveryQuery: "rosy glow powder blush pink", category: "beauty", subcategory: "Blush", tags: ["viral", "luxury"] },
];
