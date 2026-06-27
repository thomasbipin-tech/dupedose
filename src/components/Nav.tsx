"use client";
import Link from "next/link";
import { useState } from "react";

const LINKS = [
  { href: "/category/beauty", label: "Beauty" },
  { href: "/category/hair", label: "Hair" },
  { href: "/category/jewelry", label: "Jewelry" },
  { href: "/compare", label: "Compare" },
  { href: "/quiz", label: "Quiz" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav style={{ background: "#fff", borderBottom: "1px solid var(--border)" }} className="sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between" style={{ height: 64 }}>
          {/* Wordmark */}
          <Link href="/" className="no-underline">
            <span style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "0.02em", color: "var(--foreground)", fontFamily: "var(--font-sans)" }}>
              DUPEDOSE
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-9">
            {LINKS.map(({ href, label }) => (
              <Link key={href} href={href} className="no-underline uline"
                style={{ fontSize: "0.82rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--foreground)" }}>
                {label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center">
            <Link href="/search" className="no-underline btn-primary"
              style={{ padding: "9px 18px", fontSize: "0.78rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Find My Dupe
            </Link>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden flex flex-col gap-1.5 p-2" onClick={() => setOpen(!open)} aria-label="Menu">
            <span className="block" style={{ width: 22, height: 1.5, background: "var(--foreground)" }} />
            <span className="block" style={{ width: 22, height: 1.5, background: "var(--foreground)" }} />
            <span className="block" style={{ width: 22, height: 1.5, background: "var(--foreground)" }} />
          </button>
        </div>
      </div>

      {open && (
        <div style={{ background: "#fff", borderTop: "1px solid var(--border)" }} className="md:hidden px-5 py-4 flex flex-col gap-4">
          {[...LINKS, { href: "/search", label: "Find My Dupe" }].map(({ href, label }) => (
            <Link key={href} href={href} className="no-underline"
              style={{ fontSize: "0.85rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--foreground)" }}
              onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
