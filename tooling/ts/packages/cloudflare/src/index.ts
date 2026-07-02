/**
 * `@suluk/cloudflare` — API-driven provisioning + deployment for a Suluk app on Cloudflare, no wrangler CLI. A typed
 * REST client, idempotent provisioners (D1 / KV / R2 / secrets), the Workers module-script + static-assets upload
 * flow, and a one-call `deploy()` that wires them in dependency order. The platform that ships itself, shipping
 * itself — readable, testable, and the same contract-first discipline as the rest of the suite. CANDIDATE tooling.
 */
export { CloudflareClient, CloudflareError, type CloudflareClientOptions, type RequestOptions } from "./client";
export { provisionD1, queryD1, d1Rows, kvGet, kvPut, kvDelete, kvList, applyMigrations, provisionKvNamespace, provisionR2Bucket, putSecret, putSecrets, resolveZoneId, ensureWwwRedirect, removeWwwRedirect, type D1Database, type KvNamespace, type Migration } from "./resources";
export { uploadAssets, assetHash, extractAssetRuleFiles, type AssetFile, type UploadSession, type AssetRuleFiles } from "./assets";
export { deployWorker, putCronTriggers, type DeployWorkerOptions, type WorkerBinding, type WorkerMigration } from "./worker";
export { deploy, deployWith, type DeployPlan, type DeployResult, type DeployLog, type DurableObjectBinding } from "./deploy";
// the production KV-backed RateLimitStore for @suluk/hono's enforceRateLimit (MemoryRateLimitStore is dev-only).
export { kvRateLimitStore, memoryRateLimitStore, type RateLimitStore, type ConsumeOptions, type ConsumeResult, type KvLike } from "./ratelimit";
