// ────────────────────────────────────────────────────────────
// Editorial depth for flagship dupe pairs: "The Scoop" (why the match works)
// and "Key Differences" (where it honestly falls short). Grounded in the
// products' actual formulas/formats — no fabricated lab claims.
// Keyed by `${originalSlug}|${dupeSlug}`. Rendered on the original's page
// when its top-ranked alternative has an entry here.
// ────────────────────────────────────────────────────────────

export interface PairEditorial {
  scoop: string;        // why it earns the dupe label
  differences: string;  // honest gaps vs the original
}

const E: Record<string, PairEditorial> = {
  "sol-de-janeiro-brazilian-bum-bum-cream|naturewell-cheeky-firming-body-cream": {
    scoop:
      "Cheeky is the dupe that made NatureWell famous: a caffeine-infused firming body cream with the same fast-absorbing, slightly shimmery finish and a warm gourmand scent built to echo Bum Bum's pistachio-caramel signature. The firming pitch — caffeine tightening the look of skin — is the same mechanism Sol de Janeiro leans on, at less than half the price per jar.",
    differences:
      "The fragrance is the gap: Cheirosa 62 is deeper and noticeably longer-lasting on skin, while Cheeky's scent fades within a couple of hours. The Sol de Janeiro texture is also a touch richer; Cheeky reads more like a lotion-cream hybrid.",
  },
  "drunk-elephant-d-bronzi-anti-pollution-sunshine-drops|e-l-f-bronzing-drops": {
    scoop:
      "e.l.f. built its Bronzing Drops in the exact D-Bronzi mold: a concentrated liquid bronzer you mix into moisturizer or tap on top for a sun-kissed cast, with a comparable golden-brown tone and a peptide on the ingredient list to mirror the skincare angle. Applied the same way, the finished glow is very hard to tell apart — for about $11 instead of $38.",
    differences:
      "D-Bronzi's shade runs slightly more neutral-brown while e.l.f. leans warmer, and Drunk Elephant's formula carries more antioxidant extras (cocoa, virgin marula oil). The e.l.f. dropper is also thinner in texture, so it takes an extra drop to build the same depth.",
  },
  "glossier-cloud-paint|maybelline-cheek-heat-gel-cream-blush": {
    scoop:
      "Cheek Heat is the drugstore answer to Cloud Paint: a sheer, water-light gel-cream blush that melts into skin with fingertips and builds the same diffused, no-edges flush. The shade families overlap almost one-to-one, and the barely-there, second-skin finish is the whole point of both formulas — Maybelline just charges $7 for it.",
    differences:
      "Cloud Paint is a touch creamier and blends a beat more forgivingly; Cheek Heat sets faster, so you work quickly. Glossier also offers more muted, editorial shades, while Maybelline's range skews brighter.",
  },
  "rhode-peptide-lip-treatment|mcobeauty-peptide-lip-treatment": {
    scoop:
      "MCoBeauty openly clones viral hits, and its Peptide Lip Treatment is a direct recreation of Rhode's: same squeeze-tube format, same glassy 'glazed' finish, same peptide-plus-shea nourishment story, even matching flavor concepts. On lips the two are nearly interchangeable — the MCo version costs $9 to Rhode's $20.",
    differences:
      "Rhode's texture is slightly thicker and cushier, and the shade/flavor drops (like Salted Caramel) tend to sell on hype MCoBeauty can't match. Packaging feel is also a clear step down — the product inside is the close part.",
  },
  "summer-fridays-lip-butter-balm|covergirl-clean-fresh-squishy-glaze-lip-butter-balm": {
    scoop:
      "CoverGirl's Squishy Glaze is a shameless — and successful — take on the Lip Butter Balm: a thick, whipped balm in a jar-style tube that leaves the same milky, glazed sheen and pillowy feel. Shea and ceramide-style conditioners do the moisturizing work in both, and the vanilla flavor is clearly aimed at Summer Fridays' cult original.",
    differences:
      "Summer Fridays feels denser and lasts a little longer between reapplications; the CoverGirl balm is lighter and glossier at first, then wears off sooner. Shade range is smaller and the tint payoff is sheerer.",
  },
  "estee-lauder-double-wear-stay-in-place-foundation|revlon-colorstay-longwear-makeup": {
    scoop:
      "ColorStay is the longest-standing Double Wear dupe in beauty — both are medium-to-full coverage, transfer-resistant matte foundations engineered to survive a full workday. Revlon's combination/oily formula holds oil down and stays put in a way that genuinely rivals the Lauder wear-test benchmark, at roughly a quarter of the price.",
    differences:
      "Double Wear has the wider shade range and a slightly more refined, less flat matte finish. ColorStay can oxidize a touch warmer on some skin tones and feels marginally heavier by hour eight — but on wear time alone, the gap is small.",
  },
  "fenty-beauty-gloss-bomb-universal-lip-luminizer|maybelline-lip-lifter-gloss": {
    scoop:
      "Lip Lifter Gloss with hyaluronic acid hits the same brief as Gloss Bomb: a non-sticky, high-shine 'universal' gloss with a subtle shimmer that flatters most skin tones. The wand is oversized like Fenty's, the shine level is comparable, and shades like Ice mirror Gloss Bomb's famous universal appeal for half the price.",
    differences:
      "Gloss Bomb's Fu$$y scent-and-shimmer combination is part of its signature and lasts longer on the lips; Maybelline's gloss is thinner, so the shine drops off sooner. Fenty's shade Fenty Glow remains the more universally flattering nude.",
  },
  "sol-de-janeiro-brazilian-crush-cheirosa-62-fragrance-mist|coup-de-coeur-vanilla-pistachio-fragrance-mist": {
    scoop:
      "Coup de Coeur's Vanilla & Pistachio mist targets Cheirosa 62's exact accord — pistachio, salted caramel, and warm vanilla — and lands close enough that side-by-side most people identify them as the same scent family immediately. As a body mist it's used the same way, layered generously, for about a quarter of the price.",
    differences:
      "Cheirosa 62 projects further and holds its dry-down longer (three-plus hours vs roughly one to two). The Sol de Janeiro mist also has a creamier base note where the dupe leans sweeter and more linear.",
  },
  "tatcha-the-dewy-skin-cream|charlotte-tilbury-magic-cream": {
    scoop:
      "Both creams are the 'instant glow in a jar' benchmark of their brands: rich but bouncy textures that flood skin with humectants and leave the lit-from-within dew that makeup artists prep with. Magic Cream's peptide-and-hyaluronic cocktail delivers the same plumped, dewy canvas Tatcha's purple jar is famous for.",
    differences:
      "Tatcha's formula leans on Japanese botanicals (rice, green tea, algae) and feels slightly lighter; Magic Cream is heavier and better suited to drier skin. Neither is cheap — the value play depends on the size you buy.",
  },
  "drunk-elephant-c-firma-fresh-day-serum|timeless-skin-care-20-vitamin-c-e-ferulic-acid-serum": {
    scoop:
      "Timeless uses the gold-standard trio C-Firma is built on — L-ascorbic acid, vitamin E, and ferulic acid — at a straight 20% concentration. Same antioxidant chemistry, same brightening and firming target, same morning-serum slot in a routine, at roughly a third of the price.",
    differences:
      "C-Firma adds fruit enzymes and a nutrient blend on top of the core actives, and its packaging protects the formula better; pure L-AA serums like Timeless oxidize faster once opened, so buy small and use it within a few months.",
  },
  "sunday-riley-luna-sleeping-night-oil|good-molecules-1-retinol-night-oil": {
    scoop:
      "Good Molecules bottled the Luna concept — retinol delivered in a cushioning oil base for overnight use — at one percent strength for $12. The oil vehicle buffers the retinol exactly the way Luna's does, making it a gentle entry into retinoids with the same silky application.",
    differences:
      "Luna uses a trans-retinoid ester with blue tansy (hence the color and scent) and feels more elegant on skin; the Good Molecules oil is simpler and unscented. Sensitive skin may actually prefer the dupe's shorter ingredient list.",
  },
  "drunk-elephant-virgin-marula-luxury-facial-oil|the-ordinary-100-cold-pressed-virgin-marula-oil": {
    scoop:
      "This is the rare 100% dupe: both bottles contain a single ingredient — cold-pressed virgin marula oil. Same fatty-acid profile, same antioxidant content, same silky absorption. You are paying Drunk Elephant roughly four times more for identical oil in different packaging.",
    differences:
      "There is no meaningful formula difference. Drunk Elephant's dropper and bottle are nicer, and batch sourcing may vary — that's the honest extent of it.",
  },
  "drunk-elephant-t-l-c-framboos-glycolic-night-serum|the-ordinary-glycolic-acid-7-exfoliating-toner": {
    scoop:
      "Framboos is a 12% AHA/BHA blend; The Ordinary's 7% glycolic toner covers the same core job — nightly chemical exfoliation for smoother, brighter skin — with the identical star acid. Used consistently, the resurfacing result converges, and the $13 bottle lasts months.",
    differences:
      "Framboos is stronger per session (12% mixed acids plus BHA for pores) and gel-textured, so results arrive faster for resilient skin. The Ordinary's toner is gentler and needs longer to match the effect — which for many skin types is a feature, not a flaw.",
  },
  "tatcha-the-rice-polish-gentle-exfoliator|anua-rice-enzyme-brightening-cleansing-powder": {
    scoop:
      "Anua's cleansing powder is the same product category executed the same way: rice-derived enzyme powder that activates with water into a creamy foam, polishing without scrubbing. The rice-enzyme brightening mechanism is identical to Tatcha's, at a quarter of the full-size price.",
    differences:
      "Tatcha's powder foams slightly creamier and comes in four skin-type variants; Anua offers one universal formula. Fragrance is also lighter on the Anua side.",
  },
  "glow-recipe-watermelon-glow-pore-tight-toner|the-inkey-list-pha-toner": {
    scoop:
      "Strip the watermelon branding and Pore-Tight is a PHA exfoliating toner — which is precisely what The INKEY List sells for half the price. Both use polyhydroxy acids, the gentlest exfoliant class, to refine pores and smooth texture without the sting of stronger acids.",
    differences:
      "Glow Recipe's version layers in watermelon extract, hyaluronic acid, and a juicier sensorial texture; INKEY's is a straightforward clear liquid. If the scent-and-feel experience matters to you, that's what the extra $18 buys.",
  },
  "fresh-rose-deep-hydration-facial-toner|heritage-store-rosewater-facial-toner": {
    scoop:
      "Fresh's toner is, at its heart, rosewater plus humectants. Heritage Store's cult rosewater delivers the same soothing, lightly hydrating prep step — real rose distillate, same mist-and-go use — for under $14.",
    differences:
      "The Fresh formula adds hyaluronic acid and angelica extract, so it's measurably more hydrating on dry skin; pure rosewater is lighter and may need a serum layered after. Fresh's rose scent is also richer.",
  },
  "paula-s-choice-10-niacinamide-booster|the-ordinary-niacinamide-10-zinc-1": {
    scoop:
      "Identical hero active at the identical concentration: 10% niacinamide targeting pores, oil, and tone. The Ordinary adds 1% zinc PCA for extra oil control and charges $11 to Paula's Choice's $49 — the textbook case of paying for the label.",
    differences:
      "The PC booster has a more elegant, layerable texture and a few supporting soothers; The Ordinary's formula can pill under some moisturizers and feels tackier. Efficacy on the core claims is equivalent.",
  },
};

export function getPairEditorial(originalSlug: string, dupeSlug: string): PairEditorial | null {
  return E[`${originalSlug}|${dupeSlug}`] ?? null;
}
