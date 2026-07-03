/**
 * The catalog (C051) — each service id → how to MOUNT its router + where its PROVISION fragment lives. Since C053 this is a
 * DERIVED VIEW of {@link CORE_SERVICES} (the common {@link Service} interface): `CATALOG[id] = toCatalogEntry(service)`, so
 * the C051 generator reads the exact same shape it always did (the Phase-0 golden lock proves byte-identity) while the
 * authoring surface is now the open Service model. Types + the core service set live in `service.ts`.
 */
import { CORE_SERVICES, toCatalogEntry, type CatalogEntry, type EnvVar } from "./service";

// re-export the shape types from their new home so `@suluk/platform`'s public surface + `plan.ts` are unchanged.
export { CORE_SERVICES, toCatalogEntry, defineService } from "./service";
export type { Mount, EnvVar, CatalogEntry, Service, Port, Capability, CompositionSurface, Schema } from "./service";

/** The offerings, derived from the core service set. `app` is the base (no mount symbol, no fragment). */
export const CATALOG: Record<string, CatalogEntry> = Object.fromEntries(Object.entries(CORE_SERVICES).map(([id, s]) => [id, toCatalogEntry(s)]));

// DRIFT GUARD: the derived view must expose exactly the core service ids (a dropped/renamed service would silently change
// the generated app). Trivially true while CATALOG is derived, but asserted so a future hand-edit can't diverge unnoticed.
{
  const a = Object.keys(CORE_SERVICES).sort().join(",");
  const b = Object.keys(CATALOG).sort().join(",");
  if (a !== b) throw new Error(`platform: CATALOG drifted from CORE_SERVICES (${b} vs ${a})`);
}

/**
 * The always-present framework deps (every generated app: the Effect services + Hono entry + the merged provision.config
 * that imports mergeProvision from @suluk/platform + defineProvision from @suluk/provision). Union'd with each service's
 * `deps` to build package.json.
 */
// @suluk/hono (the contract + the route ENVELOPE `routeGroup`) + @suluk/effect (effectRoute + the drizzle-zod bubble-up) are
// used by EVERY module's routes now — so every generated app deps them directly. drizzle-zod is direct too: the base `app`
// exposes `tableSchemas(table)` (createSelectSchema/Insert/Update in one call), so a module derives its schemas + types there.
export const BASE_DEPS = ["@suluk/platform", "@suluk/provision", "@suluk/core", "@suluk/env", "@suluk/hono", "@suluk/effect", "effect", "hono", "drizzle-orm", "drizzle-zod"];

/** Pinned ranges for the NON-@suluk ecosystem deps — the single place they're kept current for every generated app.
 *  `@suluk/*` are NOT here: they resolve to "latest" so a package fix flows to the app via `bun update` (the C052 payoff). */
export const ECOSYSTEM_VERSIONS: Record<string, string> = {
  "better-auth": "^1.0.0",
  "@better-auth/api-key": "^1.0.0",
  "@better-auth/passkey": "^1.0.0",
  "drizzle-orm": "^0.45.2",
  "drizzle-zod": "^0.8.0",
  effect: "^3.0.0",
  hono: "^4.0.0",
  zod: "^4.0.0",
};

/** The generated app's devDeps (the Workers + TS toolchain). */
export const DEV_DEPS: Record<string, string> = {
  "@cloudflare/workers-types": "^4.20260701.1",
  "@types/node": "^26.0.1",
  typescript: "^6.0.3",
  wrangler: "^4.0.0",
};

/** Resolve a dep to its version: an @suluk/* package → "latest" (fixes flow via `bun update`); a known ecosystem dep →
 *  its pinned range; anything else → "latest" (a best-effort default). */
export function resolveVersion(dep: string): string {
  if (dep.startsWith("@suluk/")) return "latest";
  return ECOSYSTEM_VERSIONS[dep] ?? "latest";
}

/** The env vars the selected services need, de-duped by name (first declaration wins). Split with `.secret` into the
 *  `.env` secrets (the .env.temp lifecycle) vs the non-secret CONFIG (defined in platform.config.ts `vars` → wrangler `[vars]`). */
export function collectEnv(services: string[], catalog: Record<string, { env?: EnvVar[] }> = CATALOG): EnvVar[] {
  const seen = new Set<string>();
  const out: EnvVar[] = [];
  for (const s of services) for (const e of catalog[s]?.env ?? []) if (!seen.has(e.name)) (seen.add(e.name), out.push(e));
  return out;
}

/** app + auth always come first (the base + the user/apikey tables others reference); the rest keep manifest order. */
export function orderServices(services: string[]): string[] {
  const want = new Set(services);
  const head = ["app", "auth"].filter((s) => want.has(s) || s === "app"); // app is always present
  const rest = services.filter((s) => !head.includes(s));
  return [...new Set([...head, ...rest])];
}
