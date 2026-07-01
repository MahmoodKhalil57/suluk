/**
 * @suluk/platform — the platform generator (C051). Write one `definePlatform` manifest; the generator plans the
 * shadcn-registry adds, generates the wired Hono entry, and merges each module's provision fragment into a single
 * provision.config. The higher-level surface over C047's provision.config + the C050 registry: `services: ["auth",
 * "credits", "billing"]` → a whole backend. The generated `provision.config.ts` imports `mergeProvision` from here.
 */
export { definePlatform, defineSystem, defineBrand, isPlatform, type PlatformManifest, type SystemManifest, type BrandManifest, type Platform, type ServiceRef, type WireDecl } from "./manifest";
export { resolveNodeOpts, liftSystemBrand, liftLegacy, serviceId } from "./resolve";
export { resolveWiring, groupImports, assertJsonSafe, validateIdentifier, lit, type Wiring, type WireImport } from "./wire";
// C053 — the open Service interface (the common shape community registries extend): defineService + the core service set.
export { defineService, optsType, CORE_SERVICES, toCatalogEntry, type Service, type Port, type Capability, type CompositionSurface, type Schema, type McpOAuthOpts, type AuthServiceOpts } from "./service";
// the core services as named, typed consts — import these into `defineSystem({ services: [...] })` for typed opts by id.
export { appService, authService, contractService, mcpService, creditsService, keysService, billingService, costService, erasureService, emailService, webhooksService, rateLimitService, rateCreditService, i18nService, referenceService, adminService, logsService, journeysService, auditService } from "./service";
export { CATALOG, orderServices, collectEnv, resolveVersion, BASE_DEPS, ECOSYSTEM_VERSIONS, DEV_DEPS, type CatalogEntry, type Mount, type EnvVar } from "./catalog";
export { mergeProvision } from "./merge";
export { planPlatform, buildPackageJson, mergePackageJson, mergeWranglerToml, mergeGitignore, type PlatformPlan } from "./plan";
export { generatePlatform, type GenerateOptions, type GenerateResult } from "./generate";
