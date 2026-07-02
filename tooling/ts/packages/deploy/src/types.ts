/**
 * The deployment abstraction — SWAPPABLE by design. A provider turns a Suluk app (its bundled worker + bindings +
 * secrets) into a live deployment by EXECUTING over the target's API with credentials the caller loads from the
 * `@suluk/env`-decrypted `.env` — never `wrangler login` / the ambient system. Cloudflare is the first provider; the
 * interface is the contract every future target (Vercel, Fly, a self-hosted Node box) implements. Was a pure "emit
 * wrangler steps" planner; now an executor (the credential + spawn hygiene the operator asked for).
 */
import type { DeployPlan as CloudflareDeployPlan, DeployResult, DeployLog } from "@suluk/cloudflare";
import type { SchemaOrRef } from "@suluk/core";

export type { DeployResult, DeployLog } from "@suluk/cloudflare";
/** A Durable Object class to bind + migrate (Agents SDK). Re-exported from `@suluk/cloudflare` (identical shape). */
export type { DurableObjectBinding } from "@suluk/cloudflare";

/** A data entity (name + schema) — the input to `schemaToSql`/`migrationSql` (D1 DDL derivation). */
export interface DeployEntity {
  name: string;
  schema: SchemaOrRef;
}

/** Cloudflare API credentials — loaded by the CALLER from the DECRYPTED `.env` (`CLOUDFLARE_API_TOKEN` +
 *  optional `CLOUDFLARE_ACCOUNT_ID`). They never come from `wrangler login`, `~/.wrangler`, or ambient guesswork. */
export interface CloudflareCreds {
  apiToken: string;
  accountId?: string;
}

/**
 * The concrete deploy: the BUNDLED worker module + its bindings/vars/secrets. The generated `scripts/deploy.ts`
 * assembles this from `wrangler.toml` (bindings/vars) + `Bun.build` (the module) + the decrypted `.env` (secrets).
 * It is `@suluk/cloudflare`'s `DeployPlan` with the Suluk-defaulted fields made optional (see `toCloudflarePlan`).
 */
export type CloudflareDeploySpec = Omit<CloudflareDeployPlan, "compatibilityDate" | "compatibilityFlags" | "observability"> & {
  compatibilityDate?: string;
  compatibilityFlags?: string[];
  observability?: boolean;
};

/** A deployment target. `toPlan` is the pure spec→plan mapping; `deploy` EXECUTES it over the provider's API. */
export interface DeployProvider {
  name: string;
  toPlan(spec: CloudflareDeploySpec): CloudflareDeployPlan;
  deploy(creds: CloudflareCreds, spec: CloudflareDeploySpec, log?: DeployLog): Promise<DeployResult>;
}
