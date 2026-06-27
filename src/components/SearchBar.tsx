"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  large?: boolean;
  placeholder?: string;
  defaultValue?: string;
}

export default function SearchBar({ large = false, placeholder, defaultValue = "" }: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  const ph = placeholder ?? (large
    ? "Search a product, brand, ingredient, or celebrity look..."
    : "Search products, dupes, and alternatives...");

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative search-glow transition-all"
        style={{ background: "#fff", border: "1px solid var(--border-strong)", borderRadius: "var(--r-md)" }}>
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={ph}
          className="w-full outline-none bg-transparent"
          style={{
            padding: large ? "18px 160px 18px 52px" : "14px 140px 14px 48px",
            fontSize: large ? "1.05rem" : "0.95rem",
            fontFamily: "system-ui, sans-serif",
            color: "var(--foreground)",
          }}
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 btn-primary"
          style={{ fontSize: "0.82rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Search
        </button>
      </div>
    </form>
  );
}
