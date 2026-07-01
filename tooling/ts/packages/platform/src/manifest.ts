/**
 * The platform manifest (C051) — the ONLY author-facing document. Name the registry + the services you want; the generator
 * compiles it to EVERYTHING: the shadcn-add list, the wired Hono entry, the merged provision.config, AND the scaffold config
 * (package.json with each module's deps — @suluk/* on "latest" so fixes flow via `bun update`, ecosystem pinned; plus
 * tsconfig.json + components.json). `platform.config.ts` is the single surface; regenerating keeps deps current + preserves
 * any deps/scripts you added. The higher-level surface over C047's provision.config: you say "auth, credits, billing" and
 * the catalog knows each one's component + provision fragment + npm deps.
 */
export interface PlatformManifest {
  /** the app/repo name (used in the generated scaffold). */
  name: string;
  /** the shadcn registry, e.g. "MahmoodKhalil57/suluk". */
  registry: string;
  /** the services to include, in mount order — resolved against the catalog. `app` + `auth` are implied if any is listed
   *  but list them for clarity; the base + foundation always come first. */
  services: string[];
  /**
   * Per-service static OPTIONS passed to that service's mount in the generated entry (a plain JSON-serializable object).
   * E.g. enable MCP OAuth: `opts: { auth: { mcp: { loginPage, consentPage, resource, scopes } } }` → the entry emits
   * `mountAuthRoutes(app, {...})`. Only JSON-safe values (no functions/env-refs — edit the generated entry for those).
   */
  opts?: Record<string, Record<string, unknown>>;
  /**
   * NON-SECRET config values (`BASE_URL`, `EMAIL_FROM`, `TRUSTED_ORIGINS`, `ENVIRONMENT`, `STRIPE_PUBLISHABLE_KEY`, …) —
   * defined HERE, in the committed manifest, and generated into `wrangler.toml` `[vars]`. SECRETS never go here; they live
   * in `.env` (see the generated `.env.example` + the env-check preflight). Keyed by the env var name.
   */
  vars?: Record<string, string>;
}

/** Validate + return the manifest (throws on an empty service list). */
export function definePlatform(manifest: PlatformManifest): PlatformManifest {
  if (!manifest.registry) throw new Error("platform: `registry` is required (e.g. \"MahmoodKhalil57/suluk\")");
  if (!manifest.services?.length) throw new Error("platform: `services` must list at least one module");
  return manifest;
}
