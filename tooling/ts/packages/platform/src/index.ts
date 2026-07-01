/**
 * @suluk/platform — the platform generator (C051). Write one `definePlatform` manifest; the generator plans the
 * shadcn-registry adds, generates the wired Hono entry, and merges each module's provision fragment into a single
 * provision.config. The higher-level surface over C047's provision.config + the C050 registry: `services: ["auth",
 * "credits", "billing"]` → a whole backend. The generated `provision.config.ts` imports `mergeProvision` from here.
 */
export { definePlatform, type PlatformManifest } from "./manifest";
export { CATALOG, orderServices, resolveVersion, BASE_DEPS, ECOSYSTEM_VERSIONS, DEV_DEPS, type CatalogEntry, type Mount } from "./catalog";
export { mergeProvision } from "./merge";
export { planPlatform, buildPackageJson, mergePackageJson, type PlatformPlan } from "./plan";
export { generatePlatform, type GenerateOptions, type GenerateResult } from "./generate";
