/**
 * The Cloudflare provider — an EXECUTOR (no wrangler CLI, no ambient OAuth). It deploys a Suluk app to Cloudflare over
 * `@suluk/cloudflare`'s REST client: the caller passes in the bundled worker + the bindings/vars/secrets + the API
 * credentials (loaded from the `@suluk/env`-DECRYPTED `.env`, never `wrangler login`/`~/.wrangler`), and one
 * `deployCloudflare()` call provisions D1/KV/R2 → migrates → uploads assets → deploys the worker → pushes secrets →
 * sets cron. `toCloudflarePlan()` is the pure spec→plan mapping (defaults filled in), so the deploy is testable without
 * a network. The Suluk stack is already Cloudflare-native (Hono = Worker, sqlite-core = D1, frontend = assets), so this
 * is an adapter over `@suluk/cloudflare` — and the `DeployProvider` seam keeps the target swappable (Vercel/Fly next).
 */
import { deployWith, type DeployPlan, type DeployResult, type DeployLog } from "@suluk/cloudflare";
import type { CloudflareCreds, CloudflareDeploySpec, DeployProvider } from "./types";

export const DEFAULT_COMPAT_DATE = "2026-06-01";

/** Slugify an app name into a Cloudflare resource name (Workers/D1 names are `[a-z0-9-]`). */
export function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "suluk-app";
}

/** PURE: the spec → `@suluk/cloudflare` DeployPlan mapping with the Suluk defaults (compat date/flags, observability,
 *  Agents-SDK `nodejs_compat`). Separated from the network call so it is unit-testable. */
export function toCloudflarePlan(spec: CloudflareDeploySpec): DeployPlan {
  return {
    ...spec,
    compatibilityDate: spec.compatibilityDate ?? DEFAULT_COMPAT_DATE,
    // Agents-SDK Durable Objects require nodejs_compat; default it in and de-dupe if the caller already listed it.
    compatibilityFlags: Array.from(new Set([...(spec.compatibilityFlags ?? []), "nodejs_compat"])),
    observability: spec.observability ?? true,
  };
}

/**
 * Deploy a Suluk app to Cloudflare over the REST API. `creds` come from the caller's DECRYPTED `.env`
 * (`CLOUDFLARE_API_TOKEN` + optional `CLOUDFLARE_ACCOUNT_ID`) — never from `wrangler login` / the ambient system.
 * Idempotent (provisioners + migrations are ledger-safe). Returns the resolved bindings/ids for logging.
 */
export async function deployCloudflare(creds: CloudflareCreds, spec: CloudflareDeploySpec, log?: DeployLog): Promise<DeployResult> {
  if (!creds.apiToken) throw new Error("@suluk/deploy: no CLOUDFLARE_API_TOKEN — load it from your @suluk/env-decrypted .env (never wrangler login).");
  return deployWith({ apiToken: creds.apiToken, accountId: creds.accountId }, toCloudflarePlan(spec), log);
}

/** The Cloudflare deployment provider (the swappable seam). `deploy()` executes over the REST API with passed-in creds. */
export const cloudflare: DeployProvider = {
  name: "cloudflare",
  toPlan: toCloudflarePlan,
  deploy: deployCloudflare,
};
