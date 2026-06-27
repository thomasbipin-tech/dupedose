"use client";
import Link from "next/link";
import { useState } from "react";

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav style={{ background: "var(--hero-bg)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      className="sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 no-underline">
            <span className="text-2xl font-bold" style={{ color: "var(--gold)", letterSpacing: "-0.02em", fontFamily: "Georgia, serif" }}>
              Dupe<span style={{ color: "#fff" }}>Dose</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { href: "/category/beauty", label: "Beauty" },
              { href: "/category/hair", label: "Hair Care" },
              { href: "/category/jewelry", label: "Jewelry" },
              { href: "/compare", label: "Compare" },
              { href: "/quiz", label: "Beauty Quiz" },
            ].map(({ href, label }) => (
              <Link key={href} href={href}
                className="text-sm no-underline transition-colors"
                style={{ color: "rgba(255,255,255,0.7)", fontFamily: "system-ui, sans-serif" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--gold)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}>
                {label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/search"
              className="px-4 py-2 rounded-full text-sm font-medium no-underline transition-all"
              style={{ background: "var(--rose)", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
              Find My Dupe
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden flex flex-col gap-1.5 p-2" onClick={() => setOpen(!open)} aria-label="Menu">
            <span className="block w-6 h-0.5" style={{ background: open ? "var(--gold)" : "rgba(255,255,255,0.7)" }} />
            <span className="block w-6 h-0.5" style={{ background: open ? "var(--gold)" : "rgba(255,255,255,0.7)" }} />
            <span className="block w-6 h-0.5" style={{ background: open ? "var(--gold)" : "rgba(255,255,255,0.7)" }} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ background: "var(--hero-bg)", borderTop: "1px solid rgba(255,255,255,0.08)" }} className="md:hidden px-4 py-4 flex flex-col gap-4">
          {[
            { href: "/category/beauty", label: "Beauty" },
            { href: "/category/hair", label: "Hair Care" },
            { href: "/category/jewelry", label: "Jewelry" },
            { href: "/compare", label: "Compare" },
            { href: "/quiz", label: "Beauty Quiz" },
            { href: "/search", label: "Find My Dupe →" },
          ].map(({ href, label }) => (
            <Link key={href} href={href} className="text-sm no-underline"
              style={{ color: "rgba(255,255,255,0.8)", fontFamily: "system-ui, sans-serif" }}
              onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
