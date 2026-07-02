/**
 * `@suluk/deploy` — ship a Suluk app behind a SWAPPABLE target interface. A DeployProvider turns the app (its bundled
 * worker + bindings + secrets) into a LIVE deployment by EXECUTING over the target's API with credentials the caller
 * loads from the `@suluk/env`-decrypted `.env` — no `wrangler` CLI, no ambient OAuth. Cloudflare is the first provider
 * (Workers + D1 + KV/R2 + static assets), an adapter over `@suluk/cloudflare` since the stack is already
 * Cloudflare-native (Hono = Worker, sqlite-core = D1, frontend = assets). CANDIDATE.
 */
export type { DeployProvider, DeployEntity, DurableObjectBinding, CloudflareCreds, CloudflareDeploySpec, DeployResult, DeployLog } from "./types";
export { cloudflare, deployCloudflare, toCloudflarePlan, slug, DEFAULT_COMPAT_DATE } from "./cloudflare";
export { schemaToSql, createTable, entityColumns, columnDdl, tableName, type ColumnDef } from "./sql";
// contract-delta → additive migration SQL (D1 schema evolution, additive-only).
export { migrationSql } from "./migrate";
// contract-facet-derived durable bindings (which KV/R2 the contract implies; the deploy provisions them over the API).
export { durableBindings, type BindingPlan, type DurableBinding } from "./secrets";
// the StorageProvider binding: the media/upload slot — R2 (reference) + a dev memory impl.
export {
  r2Storage, memoryStorage,
  type StorageProvider, type StoredObject, type R2BucketLike,
} from "./storage";

import { cloudflare } from "./cloudflare";
import type { DeployProvider } from "./types";

/** The provider registry. Add new targets here; the interface is the contract. */
export const providers: Record<string, DeployProvider> = {
  cloudflare,
};
