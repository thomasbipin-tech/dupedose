// ────────────────────────────────────────────────────────────
// Admin allow-list. The single source of truth for "who may touch
// /admin/*". Reads ADMIN_EMAILS (comma-separated) from the server
// environment — never exposed to the client (no NEXT_PUBLIC_ prefix).
// ────────────────────────────────────────────────────────────

/** Parsed, lower-cased, de-duped list of admin emails from ADMIN_EMAILS. */
export function adminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return [
    ...new Set(
      raw
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)
    ),
  ];
}

/** True when the given email is on the ADMIN_EMAILS allow-list. */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.trim().toLowerCase());
}
