/**
 * The platform manifest. TWO authoring surfaces:
 *  - LEGACY {@link PlatformManifest} (C051) — `definePlatform({ name, registry, services, opts?, vars? })`. Kept FOREVER; the
 *    C053 refactor keeps it a strict subset so an existing config regenerates byte-for-byte (the Phase-0 golden lock).
 *  - C053 {@link SystemManifest} + {@link BrandManifest} — `definePlatform({ system, brand })`. A SYSTEM (services + their
 *    serviceOpts + globalServiceOpts + composition) is the REUSABLE/PUBLISHABLE template; a BRAND (brandOpts + globalBrandOpts)
 *    is thin + SWAPPABLE. `defineSystem` is GENERIC over the services TUPLE, so `serviceOpts` is typed per service id off the
 *    imported service objects — no codegen. The new shape LOWERS into a legacy manifest (`liftSystemBrand`) and runs the same
 *    generator.
 */
import type { Service, Schema } from "./service";

/** The C051 legacy manifest — still valid, still the byte-identity anchor. */
export interface PlatformManifest {
  /** the app/repo name (used in the generated scaffold). */
  name: string;
  /** the shadcn registry, e.g. "MahmoodKhalil57/suluk". */
  registry: string;
  /** the services to include, in mount order — resolved against the catalog. `app` + `auth` are implied if any is listed. */
  services: string[];
  /** per-service static OPTIONS passed to that service's mount in the generated entry (JSON-serializable). */
  opts?: Record<string, Record<string, unknown>>;
  /** NON-SECRET config values → generated into `wrangler.toml` `[vars]`. SECRETS never go here (they live in `.env`). */
  vars?: Record<string, string>;
}

// ── C053: the open system/brand surface ──────────────────────────────────────────────────────────────────────────────

/** A reference to a service: an imported {@link Service} object (fully typed) or a bare string id (resolved against the
 *  catalog; opts typed as `unknown`). */
export type ServiceRef = string | Service<any, any>;

/** the service id of a ref (a Service object's literal `id`, or the string itself). */
type IdOf<R> = R extends { id: infer Id extends string } ? Id : R extends string ? R : never;
/** the serviceOpts value type a ref carries (from its `serviceOpts` marker; `{}` for a typed service without opts,
 *  `unknown` for a bare string). */
type SoOf<R> = R extends { serviceOpts: Schema<infer SO> } ? SO : R extends string ? unknown : {};

/**
 * An inter-service composition EDGE (Phase 3). Declared here so a Phase-2 manifest's shape is forward-compatible; the
 * resolver ignores `wire` until the Phase-3 engine lands. `from`/`to` are `"<service>.<port|capability>"`.
 */
export interface WireDecl {
  id?: string;
  from: string;
  to: string;
  with?: Record<string, unknown>;
}

/** A SYSTEM — the reusable, publishable template. Generic over the services tuple so `serviceOpts` is typed by service id. */
export interface SystemManifest<T extends readonly ServiceRef[] = readonly ServiceRef[]> {
  /** the single core registry, e.g. "MahmoodKhalil57/suluk". (Multi-registry alias map: `registries`, Phase 4.) */
  registry?: string;
  /** alias → registry map for multi-registry systems (Phase 4). `registries.core` is the default when `registry` is unset. */
  registries?: Record<string, string>;
  /** the services, in mount order — imported {@link Service} objects (typed) and/or string ids. */
  services: T;
  /** system-wide behaviour shared by services; a service receives the keys it names in `reads.globalService` (else inert). */
  globalServiceOpts?: Record<string, unknown>;
  /** per-service serviceOpts — TYPED by service id off the imported service objects. */
  serviceOpts?: Partial<{ [K in T[number] as IdOf<K>]: SoOf<K> }>;
  /** inter-service composition edges (Phase 3). */
  wire?: WireDecl[];
}

/** A BRAND — thin, swappable per deployment. Carries the app identity + the brand-facing opts (→ `[vars]`). */
export interface BrandManifest {
  /** the deployment/app name (the wrangler + package name). Differs per brand of the same system. */
  name: string;
  /** brand identity shared by every service (BRAND_NAME, baseUrl, emailFrom, …) → `[vars]`. */
  globalBrandOpts?: Record<string, unknown>;
  /** per-service brand-facing opts → `[vars]`. */
  brandOpts?: Record<string, Record<string, unknown>>;
  /** brand-tunable EDGE params keyed by `wire.id` (Phase 3). */
  wireBrandOpts?: Record<string, Record<string, unknown>>;
}

/** A bound platform = a system + a brand. */
export interface Platform {
  system: SystemManifest<any>;
  brand: BrandManifest;
}

/** Author a SYSTEM. `const T` captures the services tuple so `serviceOpts` types resolve per service id. */
export function defineSystem<const T extends readonly ServiceRef[]>(s: SystemManifest<T>): SystemManifest<T> {
  if (!s.services?.length) throw new Error("defineSystem: `services` must list at least one service");
  return s;
}

/** Author a BRAND. */
export function defineBrand(b: BrandManifest): BrandManifest {
  if (!b.name) throw new Error("defineBrand: `name` is required");
  return b;
}

/**
 * Validate + return a platform. Accepts BOTH the legacy {@link PlatformManifest} and the C053 `{ system, brand }` shape
 * (discriminated on the `system` key). Overloaded so the return type matches the input surface.
 */
export function definePlatform(input: PlatformManifest): PlatformManifest;
export function definePlatform(input: Platform): Platform;
export function definePlatform(input: PlatformManifest | Platform): PlatformManifest | Platform {
  if (isPlatform(input)) {
    if (!input.system?.services?.length) throw new Error("platform: `system.services` must list at least one service");
    if (!input.brand?.name) throw new Error("platform: `brand.name` is required");
    return input;
  }
  if (!input.registry) throw new Error('platform: `registry` is required (e.g. "MahmoodKhalil57/suluk")');
  if (!input.services?.length) throw new Error("platform: `services` must list at least one module");
  return input;
}

/** Discriminate the C053 `{ system, brand }` shape from the legacy manifest. */
export function isPlatform(input: PlatformManifest | Platform): input is Platform {
  return typeof input === "object" && input !== null && "system" in input;
}
