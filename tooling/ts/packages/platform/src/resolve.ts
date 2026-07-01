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

/** Lower a `{ system, brand }` platform to the legacy {@link PlatformManifest} the C051 generator renders. */
export function liftSystemBrand(p: Platform): PlatformManifest {
  const { services, opts, vars } = resolveNodeOpts(p.system, p.brand);
  const registry = p.system.registry ?? p.system.registries?.core ?? "";
  return {
    name: p.brand.name,
    registry,
    services,
    ...(Object.keys(opts).length ? { opts } : {}),
    ...(Object.keys(vars).length ? { vars } : {}),
  };
}
