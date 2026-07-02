/**
 * C053 Phase 2 — resolve the four opts quadrants of a `{ system, brand }` platform and LOWER it into the legacy
 * `PlatformManifest` the C051 generator already consumes. This is the byte-identity strategy: the new authoring surface is
 * sugar that normalizes DOWN to `{ services, opts, vars }`, then the UNCHANGED `planPlatform` renders it — so a system/brand
 * manifest equivalent to the legacy one produces the SAME bytes (the Phase-0 golden lock proves it), and the legacy path is
 * untouched.
 *
 * The 2×2 (NODE opts):
 *   - serviceOpts (per-service) + globalServiceOpts-keys-a-service `reads`  →  the ENTRY (a mount's opts object)  →  `opts`
 *   - brandOpts (per-service) + globalBrandOpts + env-shaped globalServiceOpts →  wrangler `[vars]`/env             →  `vars`
 * Composition (`wire`) is Phase 3 — ignored here.
 */
import type { PlatformManifest } from "./manifest";
import type { Platform, SystemManifest, BrandManifest } from "./manifest";
import { CORE_SERVICES } from "./service";
import { deriveUrls } from "./urls";

const isPlainObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const isScalar = (v: unknown): v is string | number | boolean => typeof v === "string" || typeof v === "number" || typeof v === "boolean";

/** Deep-merge b over a (b wins), preserving a's key insertion order then b's new keys — so the emitted JSON is stable. */
function deepMerge(a: Record<string, unknown>, b: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...a };
  for (const [k, v] of Object.entries(b)) {
    const prev = out[k];
    out[k] = isPlainObject(prev) && isPlainObject(v) ? deepMerge(prev, v) : v;
  }
  return out;
}

const pick = (o: Record<string, unknown>, keys: string[]): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  for (const k of keys) if (k in o) out[k] = o[k];
  return out;
};

/** A ServiceRef → its runtime id (a string ref is the id; a Service object contributes `.id`). */
export function serviceId(ref: string | { id: string }): string {
  return typeof ref === "string" ? ref : ref.id;
}

/**
 * Resolve the node quadrants of `{ system, brand }` into the `{ services, opts, vars }` a legacy manifest carries:
 *  - `opts[id]` (→ entry): the globalServiceOpts keys the service `reads`, deep-merged UNDER its per-service serviceOpts.
 *    Empty results are omitted, so the map matches a hand-written legacy manifest (which only lists services that HAVE opts).
 *  - `vars` (→ [vars]): every scalar value across globalServiceOpts + globalBrandOpts + per-service brandOpts. `buildWrangler`
 *    only surfaces the ones that are declared service env vars, so extra keys are harmless.
 */
export function resolveNodeOpts(system: SystemManifest, brand: BrandManifest): { services: string[]; opts: Record<string, Record<string, unknown>>; vars: Record<string, string> } {
  const services = system.services.map(serviceId);
  const gso = (system.globalServiceOpts ?? {}) as Record<string, unknown>;

  const opts: Record<string, Record<string, unknown>> = {};
  for (const id of services) {
    const reads = CORE_SERVICES[id]?.reads?.globalService ?? [];
    const fromGlobal = pick(gso, reads);
    const perService = (system.serviceOpts as Record<string, Record<string, unknown>> | undefined)?.[id] ?? {};
    const eff = deepMerge(fromGlobal, perService);
    if (Object.keys(eff).length) opts[id] = eff;
  }

  const vars: Record<string, string> = {};
  const foldScalars = (o: Record<string, unknown> | undefined) => {
    for (const [k, v] of Object.entries(o ?? {})) if (isScalar(v)) vars[k] = String(v);
  };
  foldScalars(gso);
  foldScalars(brand.globalBrandOpts as Record<string, unknown> | undefined);
  for (const perBrand of Object.values(brand.brandOpts ?? {})) foldScalars(perBrand as Record<string, unknown>);

  return { services, opts, vars };
}

/** env-shaped globalServiceOpts (system behaviour delivered as a runtime env var) — the rest of `vars` is brand identity. */
const SYSTEM_VAR_NAMES = new Set(["TRUSTED_ORIGINS", "ENVIRONMENT"]);

/**
 * C058 — the single-source URL derivation, applied to a normalized {@link PlatformManifest} (BOTH authoring surfaces
 * converge here). If the manifest declares `LIVE_BASE_URL` (a bare host) AND has NOT hand-authored `BETTER_AUTH_URL`
 * (back-compat/golden-lock gate), derive every URL var: the WORKER `[vars]` from the LIVE host, the bun-dev env
 * (`manifest.localVars`) from the LOCAL host, and — when `opts.auth.mcpScopes` is present — the mcp OAuth trio from LIVE.
 * The two bare hosts + `EMAIL_DOMAIN`/`EXTRA_TRUSTED_ORIGINS` are DELETED from `vars` (pure inputs, never `[vars]`).
 * Mutates the manifest in place; a no-op when the gate is off (a legacy full-URL manifest regenerates byte-for-byte).
 */
export function deriveHosts(manifest: PlatformManifest): void {
  const vars = manifest.vars;
  if (!vars) return;
  const liveHost = vars.LIVE_BASE_URL;
  if (!liveHost || vars.BETTER_AUTH_URL) return; // gate: opt-in via LIVE_BASE_URL + never override a hand-authored URL

  const localHost = vars.LOCAL_BASE_URL ?? liveHost;
  const scopes = (manifest.opts?.auth?.mcpScopes as string[] | undefined) ?? undefined;
  const opts = { scopes, emailDomain: vars.EMAIL_DOMAIN, extraOrigins: (vars.EXTRA_TRUSTED_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean) };

  const live = deriveUrls(liveHost, liveHost, opts); // the deployed Worker: BASE_URL === the live URL
  vars.BETTER_AUTH_URL = live.BETTER_AUTH_URL;
  vars.BASE_URL = live.BASE_URL;
  vars.TRUSTED_ORIGINS = live.TRUSTED_ORIGINS;
  vars.EMAIL_FROM = live.EMAIL_FROM;
  // mcp OAuth is opt-in via `mcpScopes` (an app without it stays non-MCP). Derive the URL trio; drop the raw scope input.
  if (scopes?.length) {
    manifest.opts = { ...(manifest.opts ?? {}), auth: { ...(manifest.opts?.auth ?? {}), mcp: live.mcp } };
    delete (manifest.opts.auth as Record<string, unknown>).mcpScopes;
  }

  const local = deriveUrls(localHost, liveHost, opts); // the local bun-dev runtime: BASE_URL === the local URL
  manifest.localVars = { BASE_URL: local.BASE_URL, BETTER_AUTH_URL: local.BETTER_AUTH_URL, TRUSTED_ORIGINS: local.TRUSTED_ORIGINS, EMAIL_FROM: local.EMAIL_FROM };
  manifest.__localHost = localHost;

  // the bare hosts + override knobs are derivation INPUTS — never emit them as `[vars]`.
  delete vars.LIVE_BASE_URL;
  delete vars.LOCAL_BASE_URL;
  delete vars.EMAIL_DOMAIN;
  delete vars.EXTRA_TRUSTED_ORIGINS;
}

/**
 * The MIGRATE direction — a legacy {@link PlatformManifest} → the C053 `{ system, brand }` split (the inverse of
 * {@link liftSystemBrand}). `opts` → per-service serviceOpts; `vars` split into globalServiceOpts (system-shaped) vs
 * globalBrandOpts (identity). Round-trips byte-for-byte: `liftSystemBrand(liftLegacy(m))` generates the same app as `m`.
 */
export function liftLegacy(m: PlatformManifest): Platform {
  const globalServiceOpts: Record<string, string> = {};
  const globalBrandOpts: Record<string, string> = {};
  for (const [k, v] of Object.entries(m.vars ?? {})) (SYSTEM_VAR_NAMES.has(k) ? globalServiceOpts : globalBrandOpts)[k] = v;
  return {
    system: {
      registry: m.registry,
      services: m.services,
      ...(Object.keys(globalServiceOpts).length ? { globalServiceOpts } : {}),
      ...(m.opts && Object.keys(m.opts).length ? { serviceOpts: m.opts } : {}),
      ...(m.local ? { local: true } : {}),
    },
    brand: {
      name: m.name,
      ...(Object.keys(globalBrandOpts).length ? { globalBrandOpts } : {}),
    },
  };
}

/** Lower a `{ system, brand }` platform to the legacy {@link PlatformManifest} the C051 generator renders. */
export function liftSystemBrand(p: Platform): PlatformManifest {
  const { services, opts, vars } = resolveNodeOpts(p.system, p.brand);
  const registry = p.system.registry ?? p.system.registries?.core;
  // backstop (definePlatform also guards): never lower to an empty registry → malformed "/service" adds.
  if (!registry) throw new Error('platform: `system.registry` (or `system.registries.core`) is required (e.g. "MahmoodKhalil57/suluk")');
  return {
    name: p.brand.name,
    registry,
    services,
    ...(Object.keys(opts).length ? { opts } : {}),
    ...(Object.keys(vars).length ? { vars } : {}),
    ...(p.system.local ? { local: true } : {}),
  };
}
