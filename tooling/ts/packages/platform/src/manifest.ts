/**
 * The platform manifest (C051) — the one author-facing document. Name the registry + the services you want; the generator
 * compiles it to a shadcn-add list + a wired Hono entry + a merged provision.config. The higher-level surface over C047's
 * provision.config: you say "auth, credits, billing" and the catalog knows each one's component + provision fragment.
 */
export interface PlatformManifest {
  /** the app/repo name (used in the generated scaffold). */
  name: string;
  /** the shadcn registry, e.g. "MahmoodKhalil57/suluk". */
  registry: string;
  /** the services to include, in mount order — resolved against the catalog. `app` + `auth` are implied if any is listed
   *  but list them for clarity; the base + foundation always come first. */
  services: string[];
}

/** Validate + return the manifest (throws on an empty service list). */
export function definePlatform(manifest: PlatformManifest): PlatformManifest {
  if (!manifest.registry) throw new Error("platform: `registry` is required (e.g. \"MahmoodKhalil57/suluk\")");
  if (!manifest.services?.length) throw new Error("platform: `services` must list at least one module");
  return manifest;
}
