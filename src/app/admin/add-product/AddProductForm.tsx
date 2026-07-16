"use client";
import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Category = { slug: string; label: string };
type DupeLevel = "premium" | "similar" | "budget";

interface SearchHit {
  id: string;
  slug: string;
  name: string;
  brandName: string;
  image?: string;
  category?: string;
}

const INPUT_STYLE: React.CSSProperties = {
  background: "#fff",
  border: "1px solid var(--border-strong)",
  borderRadius: "var(--r-md)",
  padding: "11px 13px",
  fontSize: "0.92rem",
  outline: "none",
  width: "100%",
  color: "var(--foreground)",
};

const CARD_STYLE: React.CSSProperties = {
  background: "#fff",
  border: "1px solid var(--border)",
  borderRadius: "var(--r-lg)",
  padding: "1.5rem",
  marginBottom: "1.5rem",
};

function Label({ children, htmlFor, required }: { children: React.ReactNode; htmlFor?: string; required?: boolean }) {
  return (
    <label
      htmlFor={htmlFor}
      className="eyebrow"
      style={{ display: "block", marginBottom: "0.4rem", color: "var(--muted)" }}
    >
      {children}
      {required && <span style={{ color: "var(--accent)", marginLeft: 4 }}>*</span>}
    </label>
  );
}

export default function AddProductForm({ categories }: { categories: Category[] }) {
  const router = useRouter();

  // Section 1 — URL / parse state
  const [url, setUrl] = useState("");
  const [parsing, setParsing] = useState(false);
  const lastParsed = useRef<string>("");

  // Section 2 — product fields
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [asin, setAsin] = useState("");
  const [affiliateUrl, setAffiliateUrl] = useState("");

  // Section 3 — dupe relationship
  const [isDupe, setIsDupe] = useState(false);
  const [dupeQuery, setDupeQuery] = useState("");
  const [dupeResults, setDupeResults] = useState<SearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [original, setOriginal] = useState<SearchHit | null>(null);
  const [matchScore, setMatchScore] = useState(85);
  const [dupeLevel, setDupeLevel] = useState<DupeLevel>("similar");
  const [reason, setReason] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [saving, setSaving] = useState(false);

  // ── Parse the pasted SiteStripe URL ──────────────────────────
  const parseUrl = useCallback(async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === lastParsed.current) return;
    if (!/^https?:\/\//i.test(trimmed)) return;
    lastParsed.current = trimmed;
    setParsing(true);
    try {
      const res = await fetch("/api/admin/parse-amazon-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Couldn't read that URL.");
        lastParsed.current = ""; // allow a retry
        return;
      }
      setAsin(data.asin ?? "");
      setAffiliateUrl(data.affiliateUrl ?? trimmed);
      if (data.title) setName((prev) => prev || data.title);
      if (data.imageUrl) setImageUrl((prev) => prev || data.imageUrl);
      if (data.description) setDescription((prev) => prev || data.description);
      if (data.price != null) setPrice((prev) => prev || String(data.price));
      if (data.warning) toast.warning(data.warning);
      else toast.success("Product details loaded.");
    } catch {
      toast.error("Network error while reading the URL.");
      lastParsed.current = "";
    } finally {
      setParsing(false);
    }
  }, []);

  // ── Debounced product search for the dupe "original" ─────────
  function onDupeQueryChange(value: string) {
    setDupeQuery(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!value.trim()) {
      setDupeResults([]);
      return;
    }
    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(value.trim())}`);
        const data = await res.json();
        setDupeResults((data.results ?? []).slice(0, 5));
      } catch {
        setDupeResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }

  // ── Save ─────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return toast.error("Product name is required.");
    if (!imageUrl.trim()) return toast.error("Image URL is required.");
    if (!category) return toast.error("Choose a category.");
    if (!affiliateUrl.trim()) return toast.error("Paste a SiteStripe URL first.");
    if (isDupe && !original) return toast.error("Select the original product this is a dupe of.");

    setSaving(true);
    const payload = {
      name: name.trim(),
      brand: brand.trim(),
      category,
      imageUrl: imageUrl.trim(),
      price: price === "" ? null : Number(price),
      description: description.trim(),
      asin: asin.trim(),
      affiliateUrl: affiliateUrl.trim(),
      rawUrl: affiliateUrl.trim(),
      dupe:
        isDupe && original
          ? { originalId: original.id, matchScore, dupeLevel, reason: reason.trim() }
          : null,
    };

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to save product.");
        setSaving(false);
        return;
      }
      toast.success("Product saved ✦");
      setTimeout(() => router.push(`/product/${data.slug}`), 700);
    } catch {
      toast.error("Network error while saving.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* ── Section 1 — SiteStripe URL ─────────────────────────── */}
      <section style={CARD_STYLE}>
        <Label htmlFor="sitestripe" required>
          SiteStripe affiliate URL
        </Label>
        <div style={{ position: "relative" }}>
          <input
            id="sitestripe"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={(e) => parseUrl(e.target.value)}
            onPaste={(e) => {
              const pasted = e.clipboardData.getData("text");
              setTimeout(() => parseUrl(pasted), 0);
            }}
            placeholder="Paste SiteStripe affiliate URL..."
            className="search-glow"
            style={{ ...INPUT_STYLE, paddingRight: parsing ? 110 : 13 }}
          />
          {parsing && (
            <span
              style={{
                position: "absolute",
                right: 13,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "0.75rem",
                color: "var(--muted)",
                letterSpacing: "0.04em",
              }}
            >
              Reading…
            </span>
          )}
        </div>
        <p style={{ fontSize: "0.78rem", color: "var(--muted-2)", marginTop: "0.5rem" }}>
          We extract the ASIN and auto-fill the fields below. You can edit everything before saving.
        </p>
      </section>

      {/* ── Section 2 — Product details ────────────────────────── */}
      <section style={CARD_STYLE}>
        <h2 style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: "1.25rem" }}>Product details</h2>

        <div style={{ display: "grid", gap: "1.1rem" }}>
          <div>
            <Label htmlFor="name" required>
              Name
            </Label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} style={INPUT_STYLE} className="search-glow" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.1rem" }}>
            <div>
              <Label htmlFor="brand">Brand</Label>
              <input id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} style={INPUT_STYLE} className="search-glow" />
            </div>
            <div>
              <Label htmlFor="category" required>
                Category
              </Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ ...INPUT_STYLE, appearance: "auto", cursor: "pointer" }}
              >
                <option value="">Select a category…</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="imageUrl" required>
              Image URL
            </Label>
            <div style={{ display: "flex", gap: "0.85rem", alignItems: "flex-start" }}>
              <input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                style={INPUT_STYLE}
                className="search-glow"
              />
              <div
                style={{
                  flex: "0 0 auto",
                  width: 52,
                  height: 52,
                  borderRadius: "var(--r-md)",
                  border: "1px solid var(--border)",
                  background: "var(--background-alt)",
                  overflow: "hidden",
                }}
              >
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : null}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.1rem" }}>
            <div>
              <Label htmlFor="price">Price (USD)</Label>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={INPUT_STYLE}
                className="search-glow"
              />
            </div>
            <div>
              <Label htmlFor="asin">ASIN</Label>
              <input
                id="asin"
                value={asin}
                readOnly
                style={{ ...INPUT_STYLE, background: "var(--background-alt)", color: "var(--muted)" }}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              style={{ ...INPUT_STYLE, resize: "vertical", lineHeight: 1.5 }}
              className="search-glow"
            />
          </div>

          <div>
            <Label htmlFor="affiliate">Affiliate URL</Label>
            <input
              id="affiliate"
              value={affiliateUrl}
              readOnly
              style={{
                ...INPUT_STYLE,
                background: "var(--background-alt)",
                color: "var(--muted)",
                fontSize: "0.8rem",
                textOverflow: "ellipsis",
              }}
            />
          </div>
        </div>
      </section>

      {/* ── Section 3 — Dupe relationship ──────────────────────── */}
      <section style={CARD_STYLE}>
        <label style={{ display: "flex", alignItems: "center", gap: "0.7rem", cursor: "pointer" }}>
          <input type="checkbox" checked={isDupe} onChange={(e) => setIsDupe(e.target.checked)} style={{ width: 17, height: 17, cursor: "pointer" }} />
          <span style={{ fontSize: "1.05rem", fontWeight: 600 }}>Is this a dupe of an existing product?</span>
        </label>

        {isDupe && (
          <div style={{ marginTop: "1.4rem", display: "grid", gap: "1.2rem" }} className="fade-up">
            {/* Original picker */}
            <div>
              <Label htmlFor="dupeSearch" required>
                Original product
              </Label>
              {original ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.85rem",
                    border: "1px solid var(--foreground)",
                    borderRadius: "var(--r-md)",
                    padding: "0.6rem 0.75rem",
                  }}
                >
                  <Thumb hit={original} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {original.brandName}
                    </p>
                    <p style={{ fontSize: "0.9rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {original.name}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOriginal(null);
                      setDupeQuery("");
                      setDupeResults([]);
                    }}
                    className="uline"
                    style={{ background: "none", border: "none", fontSize: "0.78rem", cursor: "pointer", color: "var(--muted)" }}
                  >
                    Change
                  </button>
                </div>
              ) : (
                <>
                  <input
                    id="dupeSearch"
                    value={dupeQuery}
                    onChange={(e) => onDupeQueryChange(e.target.value)}
                    placeholder="Search products by name or brand…"
                    style={INPUT_STYLE}
                    className="search-glow"
                    autoComplete="off"
                  />
                  {searching && <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "0.5rem" }}>Searching…</p>}
                  {dupeResults.length > 0 && (
                    <div
                      style={{
                        marginTop: "0.6rem",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--r-md)",
                        overflow: "hidden",
                      }}
                    >
                      {dupeResults.map((hit) => (
                        <button
                          key={hit.id}
                          type="button"
                          onClick={() => {
                            setOriginal(hit);
                            setDupeResults([]);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            width: "100%",
                            padding: "0.55rem 0.7rem",
                            background: "#fff",
                            border: "none",
                            borderBottom: "1px solid var(--border)",
                            cursor: "pointer",
                            textAlign: "left",
                          }}
                        >
                          <Thumb hit={hit} />
                          <span style={{ minWidth: 0 }}>
                            <span style={{ display: "block", fontSize: "0.68rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                              {hit.brandName}
                            </span>
                            <span style={{ display: "block", fontSize: "0.88rem", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {hit.name}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Match score */}
            <div>
              <Label htmlFor="matchScore">
                Match score — <span style={{ color: "var(--foreground)", fontWeight: 700 }}>{matchScore}%</span>
              </Label>
              <input
                id="matchScore"
                type="range"
                min={0}
                max={100}
                value={matchScore}
                onChange={(e) => setMatchScore(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--foreground)", cursor: "pointer" }}
              />
            </div>

            {/* Dupe level */}
            <div>
              <Label>Dupe level</Label>
              <div style={{ display: "flex", gap: "0.6rem" }}>
                {(["premium", "similar", "budget"] as DupeLevel[]).map((lvl) => {
                  const active = dupeLevel === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDupeLevel(lvl)}
                      style={{
                        flex: 1,
                        padding: "0.6rem",
                        borderRadius: "var(--r-md)",
                        border: active ? "1px solid var(--foreground)" : "1px solid var(--border-strong)",
                        background: active ? "var(--foreground)" : "#fff",
                        color: active ? "#fff" : "var(--foreground)",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        textTransform: "capitalize",
                        cursor: "pointer",
                      }}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reason */}
            <div>
              <Label htmlFor="reason">Reason</Label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder="Why is this a good dupe? (e.g. same active ingredient at a fraction of the price)"
                style={{ ...INPUT_STYLE, resize: "vertical", lineHeight: 1.5 }}
                className="search-glow"
              />
            </div>
          </div>
        )}
      </section>

      {/* ── Save ───────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.8rem" }}>
        <button
          type="submit"
          disabled={saving || parsing}
          className="btn-primary"
          style={{
            padding: "13px 28px",
            fontSize: "0.8rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            cursor: saving ? "wait" : "pointer",
            opacity: saving || parsing ? 0.7 : 1,
          }}
        >
          {saving ? "Saving…" : "Save product"}
        </button>
      </div>
    </form>
  );
}

function Thumb({ hit }: { hit: SearchHit }) {
  return (
    <span
      style={{
        flex: "0 0 auto",
        width: 40,
        height: 40,
        borderRadius: "var(--r-sm)",
        overflow: "hidden",
        background: "var(--background-alt)",
        display: "inline-block",
      }}
    >
      {hit.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={hit.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : null}
    </span>
  );
}
