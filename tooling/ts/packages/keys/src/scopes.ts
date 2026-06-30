/**
 * The key permission/metadata model (C046) — pure, defensive parsing of what a key carries: its permissions JSON
 * (`{resource:[actions]}` → flat `["resource:action"]` scopes, via @suluk/better-auth) and its metadata (the per-key
 * PAID credit cap + the rate-limit share %). A bad/absent value reads as "no scopes" / "no override" — never throws.
 * Extracted verbatim from the source.
 */
import { permissionsToScopes } from "@suluk/better-auth";

/** permissions JSON (`{resource:[actions]}`) → flat `["resource:action"]` scopes, defensively (a bad value → no scopes). */
export const parseScopes = (permissions: string | null): string[] => {
  if (!permissions) return [];
  try {
    const parsed: unknown = JSON.parse(permissions);
    if (typeof parsed !== "object" || parsed === null) return [];
    const perms: Record<string, string[]> = {};
    for (const [k, v] of Object.entries(parsed)) if (Array.isArray(v)) perms[k] = v.filter((x): x is string => typeof x === "string");
    return permissionsToScopes(perms);
  } catch {
    return [];
  }
};

/** metadata JSON → the per-key controls (each null when absent/invalid): the PAID credit cap + the rate-limit share %.
 *  Defensive — a bad value reads as "no override"; the share is clamped to [1,100] to mirror the auth-time clamp. */
export function parseKeyMeta(metadata: string | null): { creditLimit: number | null; rateLimitSharePct: number | null } {
  let creditLimit: number | null = null;
  let rateLimitSharePct: number | null = null;
  if (metadata) {
    try {
      const parsed: unknown = JSON.parse(metadata);
      if (typeof parsed === "object" && parsed !== null) {
        if ("creditLimit" in parsed) {
          const n = Number((parsed as Record<string, unknown>).creditLimit);
          if (Number.isFinite(n)) creditLimit = n;
        }
        if ("rateLimitSharePct" in parsed) {
          const n = Number((parsed as Record<string, unknown>).rateLimitSharePct);
          if (Number.isFinite(n)) rateLimitSharePct = Math.min(100, Math.max(1, Math.round(n)));
        }
      }
    } catch {
      /* bad value → no override */
    }
  }
  return { creditLimit, rateLimitSharePct };
}
