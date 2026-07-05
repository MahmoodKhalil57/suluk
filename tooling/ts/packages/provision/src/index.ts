/**
 * `@suluk/provision` — declarative service provisioning for a Suluk app, modelled on the Open Service Broker API and
 * driven like drizzle-kit (C047). Declare the infra you want in one config; each service (Cloudflare D1/KV/R2/secrets,
 * Stripe, a domain, a scoped token) is an OSB {@link Broker} advertising a {@link Catalog} and answering provision /
 * bind / deprovision. `plan` diffs desired-vs-live (pure), `apply` walks the binding DAG (provision → poll async
 * last-operation → bind → land credentials in @suluk/env), `assertNoDrift` is the CI gate. This package is the OSB
 * *client* / orchestrator — a layer ABOVE @suluk/cloudflare / @suluk/deploy / @suluk/env, which it composes as brokers +
 * the binding sink. This barrel is the CORE framework; the concrete brokers + the CLI ship alongside it.
 *
 * C101: `deriveInstanceSpecs` projects a v4 "Suluk" document's `x-suluk-provision` facet (declared alongside the
 * document's routes/jobs — `@suluk/core`'s `SulukProvisionInstance`) into this package's own `InstanceSpec[]`, the
 * OSB wire-contract types below now RE-EXPORTED from `@suluk/core` (the same companion-model treatment as JSON
 * Schema/CloudEvents/AsyncAPI) rather than defined here.
 */
export type {
  OperationState, ServicePlan, ServiceOffering, Catalog,
  InstanceSpec, InstanceState,
  ProvisionRequest, ProvisionResult, BindRequest, BindResult, OperationRequest,
  Broker, BindingSink, StateStore,
} from "./types";
export { deriveInstanceSpecs } from "./derive";
// the complete OSB v2 wire contract (spec.md / openapiv4.json) — re-exported from @suluk/core (C101).
export type {
  JsonObject, Context, Metadata, MaintenanceInfo, DashboardClient,
  Schemas, ServiceInstanceSchema, ServiceBindingSchema, ServiceRequires,
  Plan, Service, CatalogResponse,
  ServiceInstanceMetadata, ServiceInstanceProvisionRequestBody, ServiceInstanceProvisionResponse,
  ServiceInstanceAsyncOperation, ServiceInstanceUpdateRequestBody, ServiceInstancePreviousValues,
  ServiceInstanceResource, AsyncOperation, LastOperationResource,
  ServiceBindingResouceObject, ServiceBindingRequest, ServiceBindingMetadata,
  ServiceBindingEndpoint, ServiceBindingVolumeMountDevice, ServiceBindingVolumeMount,
  ServiceBindingResponse, ServiceBindingResource, ServiceBrokerError,
} from "./types";
export { defineProvision, type ProvisionConfig } from "./config";
export { topoOrder } from "./dag";
export { parseRef, depsOf, resolveParams, stableStringify, fingerprint } from "./refs";
export { plan, type ProvisionPlan, type PlanStep, type StepAction } from "./plan";
export { apply, type ApplyOptions, type ApplyResult, type AppliedStep } from "./apply";
export { pollToDone, type PollOptions } from "./poll";
export { checkDrift, assertNoDrift, type DriftReport } from "./check";
export { pull, reconcile, discover, type PullReport, type PullEntry, type PullStatus, type DiscoveredInstance } from "./pull";
export { teardown, type TeardownOptions, type TeardownResult } from "./teardown";
// the drizzle-style snapshot + migration model (repeatable, documentable steps).
export { snapshot, EMPTY_SNAPSHOT, SNAPSHOT_VERSION, type Snapshot } from "./snapshot";
export { diffSnapshots, migrationTag, type Migration, type MigrationStep } from "./migration";
export { memoryMigrationStore, fileMigrationStore, type MigrationStore, type MigrationJournal } from "./migration-store";
export { generate } from "./generate";
export { migrate, type MigrateOptions, type MigrateResult } from "./migrate";
export { memoryStore, memorySink } from "./memory";
export { fileStore } from "./file-store";
export { envSink, type EnvSinkOptions } from "./env-sink";
// the concrete Cloudflare brokers (wrap @suluk/cloudflare's idempotent provisioners).
export { cloudflareD1, cloudflareKv, cloudflareR2, cloudflareSecrets, cloudflareToken, cloudflareWwwRedirect } from "./brokers/cloudflare";
// re-export the client the brokers are built from, so a consumer's `new CloudflareClient()` matches the brokers' expected
// type EXACTLY — even when the consumer app resolves a different @suluk/cloudflare version than the one nested under provision.
export { CloudflareClient } from "@suluk/cloudflare";
export { cloudflarePagesDomain } from "./brokers/cloudflare-domains";
// the drizzle-kit-style app config + CLI (plan / apply / check / status).
export { defineProvisionApp, type ProvisionApp } from "./app";
export { runCli, type CliResult } from "./cli";
