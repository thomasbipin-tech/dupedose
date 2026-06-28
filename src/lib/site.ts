// Central site config. Canonical domain is dupedose.com (HTTPS). Override
// with NEXT_PUBLIC_SITE_URL if ever needed (e.g. a staging URL).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.dupedose.com").replace(/\/$/, "");
export const SITE_NAME = "DupeDose";
export const SITE_TAGLINE = "Find your perfect beauty match";
export const SITE_DESCRIPTION =
  "DupeDose is an AI-powered discovery engine for beauty, hair care, and jewelry. Search any luxury or viral product and find the best affordable dupes and alternatives — ranked by match score with the reasoning behind each pick.";

export function absoluteUrl(path: string) {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
