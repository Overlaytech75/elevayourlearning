/**
 * Client-safe environment flags.
 *
 * Only public values (Supabase URL / publishable key) and feature flags are
 * ever exposed to the browser. Never read or expose service-role keys here.
 *
 * Both flags default to ENABLED so the hosted Lovable Cloud app is unaffected.
 * A local `.env.local` can opt out:
 *   VITE_AI_ENABLED=false
 *   VITE_GOOGLE_AUTH_ENABLED=false
 */
function flag(value: unknown, fallback: boolean): boolean {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value).toLowerCase() !== "false";
}

export const AI_ENABLED = flag(import.meta.env.VITE_AI_ENABLED, true);
export const GOOGLE_AUTH_ENABLED = flag(import.meta.env.VITE_GOOGLE_AUTH_ENABLED, true);

export const AI_UNAVAILABLE_MESSAGE =
  "AI features are unavailable in local development. Everything else works normally.";
