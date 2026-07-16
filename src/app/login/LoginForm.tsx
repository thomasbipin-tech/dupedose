"use client";
import { useState, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/admin/add-product";
  const denied = params.get("denied") === "1";
  const linkError = params.get("error");

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setStatus("sending");
    setMessage("");

    const supabase = createSupabaseBrowserClient();
    const safeNext = next.startsWith("/") ? next : "/admin/add-product";
    const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;

    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: { emailRedirectTo },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
    } else {
      setStatus("sent");
    }
  }

  return (
    <div className="fade-up">
      <p className="eyebrow" style={{ color: "var(--accent)", marginBottom: "0.75rem" }}>
        DupeDose Admin
      </p>
      <h1
        className="font-serif"
        style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.01em", marginBottom: "0.5rem" }}
      >
        Sign in
      </h1>
      <p style={{ color: "var(--muted)", fontSize: "0.95rem", marginBottom: "2rem" }}>
        Enter your admin email and we&apos;ll send you a secure sign-in link.
      </p>

      {denied && (
        <div
          role="alert"
          style={{
            background: "var(--accent-soft)",
            border: "1px solid #e0bcc6",
            color: "var(--accent)",
            borderRadius: "var(--r-md)",
            padding: "0.75rem 1rem",
            fontSize: "0.85rem",
            marginBottom: "1.25rem",
          }}
        >
          That account isn&apos;t authorized for the admin area. Sign in with an admin email.
        </div>
      )}
      {linkError && (
        <div
          role="alert"
          style={{
            background: "var(--accent-soft)",
            border: "1px solid #e0bcc6",
            color: "var(--accent)",
            borderRadius: "var(--r-md)",
            padding: "0.75rem 1rem",
            fontSize: "0.85rem",
            marginBottom: "1.25rem",
          }}
        >
          {linkError}
        </div>
      )}

      {status === "sent" ? (
        <div
          style={{
            background: "var(--background-alt)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-md)",
            padding: "1.5rem",
          }}
        >
          <p style={{ fontWeight: 600, marginBottom: "0.4rem" }}>Check your inbox ✦</p>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
            We sent a sign-in link to <strong style={{ color: "var(--foreground)" }}>{email}</strong>.
            Open it on this device to continue. The link expires shortly.
          </p>
          <button
            onClick={() => setStatus("idle")}
            className="uline"
            style={{
              marginTop: "1rem",
              background: "none",
              border: "none",
              color: "var(--foreground)",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
            }}
          >
            Use a different email
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <label
            htmlFor="email"
            className="eyebrow"
            style={{ display: "block", marginBottom: "0.5rem", color: "var(--muted)" }}
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full search-glow"
            style={{
              background: "#fff",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--r-md)",
              padding: "12px 14px",
              fontSize: "0.95rem",
              outline: "none",
              marginBottom: "1rem",
            }}
          />

          {status === "error" && (
            <p style={{ color: "var(--accent)", fontSize: "0.85rem", marginBottom: "1rem" }}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "sending"}
            className="btn-primary w-full"
            style={{
              padding: "13px 18px",
              fontSize: "0.8rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: status === "sending" ? "wait" : "pointer",
              opacity: status === "sending" ? 0.7 : 1,
            }}
          >
            {status === "sending" ? "Sending…" : "Send sign-in link"}
          </button>
        </form>
      )}

      <p style={{ marginTop: "2rem", fontSize: "0.8rem", color: "var(--muted-2)" }}>
        <Link href="/" className="uline" style={{ color: "var(--muted)" }}>
          ← Back to DupeDose
        </Link>
      </p>
    </div>
  );
}
