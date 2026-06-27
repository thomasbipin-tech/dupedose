"use client";
import { useState } from "react";
import Link from "next/link";

interface Step {
  id: string;
  question: string;
  options: { label: string; value: string; icon: string }[];
}

const STEPS: Step[] = [
  {
    id: "goal",
    question: "What's your main beauty goal?",
    options: [
      { label: "Repair damaged hair", value: "hair-repair", icon: "◈" },
      { label: "Upgrade my skincare", value: "skincare", icon: "✦" },
      { label: "Find jewelry dupes", value: "jewelry", icon: "◇" },
      { label: "Dupe a luxury product", value: "dupe", icon: "★" },
    ],
  },
  {
    id: "budget",
    question: "What's your monthly beauty budget?",
    options: [
      { label: "Under $30", value: "budget", icon: "💛" },
      { label: "$30 – $100", value: "mid", icon: "💜" },
      { label: "$100 – $300", value: "premium", icon: "🩷" },
      { label: "$300+", value: "luxury", icon: "✦" },
    ],
  },
  {
    id: "hair",
    question: "What's your hair type?",
    options: [
      { label: "Fine / Thin", value: "fine", icon: "〜" },
      { label: "Thick / Coarse", value: "thick", icon: "≋" },
      { label: "Curly / Coily", value: "curly", icon: "∿" },
      { label: "Color-treated", value: "colored", icon: "◉" },
    ],
  },
  {
    id: "skin",
    question: "What's your skin type?",
    options: [
      { label: "Dry / Sensitive", value: "dry", icon: "❄" },
      { label: "Oily / Acne-prone", value: "oily", icon: "☀" },
      { label: "Combination", value: "combo", icon: "◑" },
      { label: "Normal / Balanced", value: "normal", icon: "✓" },
    ],
  },
  {
    id: "vibe",
    question: "Which aesthetic resonates with you?",
    options: [
      { label: "Quiet Luxury", value: "quiet-luxury", icon: "○" },
      { label: "Bold & Maximalist", value: "bold", icon: "★" },
      { label: "Clean & Minimal", value: "clean", icon: "□" },
      { label: "Celebrity-Inspired", value: "celeb", icon: "◎" },
    ],
  },
];

const RECS: Record<string, { label: string; products: { name: string; href: string; desc: string }[] }> = {
  "hair-repair": {
    label: "Hair Repair Routine",
    products: [
      { name: "Olaplex No.3", href: "/product/olaplex-no3-hair-perfector", desc: "The gold-standard bond builder" },
      { name: "K18 Leave-In Mask", href: "/product/k18-leave-in-molecular-repair-hair-mask", desc: "Clinically proven 4-minute treatment" },
      { name: "L'Oréal Bond Repair", href: "/product/loreal-everpure-bond-repair-serum", desc: "Budget alternative, same active" },
    ],
  },
  "skincare": {
    label: "Skincare Discovery",
    products: [
      { name: "CeraVe Moisturizing Cream", href: "/product/cerave-moisturizing-cream", desc: "Dermatologist's #1 choice" },
      { name: "La Mer Crème", href: "/product/la-mer-creme-de-la-mer", desc: "The luxury benchmark" },
    ],
  },
  "jewelry": {
    label: "Jewelry Alternatives",
    products: [
      { name: "Missoma Screw Bangle", href: "/product/missoma-screw-bangle-cuff", desc: "91% match to Cartier Love" },
      { name: "Mejuri Bold Cuff", href: "/product/mejuri-gold-vermeil-bold-cuff", desc: "Minimalist luxury at $78" },
    ],
  },
  "dupe": {
    label: "Top Dupes Right Now",
    products: [
      { name: "NYX Butter Gloss", href: "/product/nyx-butter-gloss-praline", desc: "Charlotte Tilbury Pillow Talk dupe" },
      { name: "L'Oréal Bond Repair", href: "/product/loreal-everpure-bond-repair-serum", desc: "Olaplex dupe — same active ingredient" },
      { name: "Mejuri Bold Cuff", href: "/product/mejuri-gold-vermeil-bold-cuff", desc: "Cartier Love dupe" },
    ],
  },
};

export default function QuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  function handleOption(stepId: string, value: string) {
    const next = { ...answers, [stepId]: value };
    setAnswers(next);
    if (step < STEPS.length - 1) {
      setTimeout(() => setStep(s => s + 1), 300);
    } else {
      setTimeout(() => setDone(true), 300);
    }
  }

  const goal = answers.goal ?? "dupe";
  const recs = RECS[goal] ?? RECS.dupe;
  const progress = ((step + 1) / STEPS.length) * 100;

  if (done) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>✦</p>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Your Beauty Profile
        </h2>
        <p style={{ color: "var(--muted)", fontFamily: "system-ui, sans-serif", marginBottom: "2rem" }}>
          Based on your answers, here&apos;s your personalised {recs.label}:
        </p>

        <div className="flex flex-col gap-4 mb-8">
          {recs.products.map((p) => (
            <Link key={p.href} href={p.href} className="no-underline">
              <div className="p-5 rounded-2xl text-left transition-all product-card"
                style={{ background: "#fff", border: "1px solid var(--border)" }}>
                <p className="font-semibold" style={{ fontFamily: "Georgia, serif", fontSize: "1.05rem", marginBottom: "0.25rem" }}>{p.name}</p>
                <p style={{ color: "var(--muted)", fontFamily: "system-ui, sans-serif", fontSize: "0.875rem" }}>{p.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <button onClick={() => { setStep(0); setAnswers({}); setDone(false); }}
            className="px-6 py-3 rounded-full font-medium"
            style={{ border: "2px solid var(--border)", background: "none", fontFamily: "system-ui, sans-serif", cursor: "pointer" }}>
            Retake Quiz
          </button>
          <Link href="/search"
            className="no-underline px-6 py-3 rounded-full font-medium"
            style={{ background: "var(--rose)", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
            Explore All Products →
          </Link>
        </div>
      </div>
    );
  }

  const current = STEPS[step];

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      {/* Progress */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--rose)", fontFamily: "system-ui, sans-serif" }}>
            Beauty Quiz — Step {step + 1} of {STEPS.length}
          </p>
          <p className="text-xs" style={{ color: "var(--muted)", fontFamily: "system-ui, sans-serif" }}>{Math.round(progress)}%</p>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: "var(--rose)" }} />
        </div>
      </div>

      <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.75rem", fontWeight: 700, marginBottom: "2rem", textAlign: "center" }}>
        {current.question}
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {current.options.map((opt) => {
          const selected = answers[current.id] === opt.value;
          return (
            <button key={opt.value}
              onClick={() => handleOption(current.id, opt.value)}
              className="p-6 rounded-2xl text-center transition-all"
              style={{
                background: selected ? "var(--rose)" : "#fff",
                color: selected ? "#fff" : "var(--foreground)",
                border: selected ? "2px solid var(--rose)" : "2px solid var(--border)",
                fontFamily: "system-ui, sans-serif",
                cursor: "pointer",
                transform: selected ? "scale(0.97)" : "scale(1)",
              }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{opt.icon}</div>
              <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{opt.label}</div>
            </button>
          );
        })}
      </div>

      {step > 0 && (
        <div className="text-center mt-6">
          <button onClick={() => setStep(s => s - 1)} className="text-sm"
            style={{ color: "var(--muted)", fontFamily: "system-ui, sans-serif", background: "none", border: "none", cursor: "pointer" }}>
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}
