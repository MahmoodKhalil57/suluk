/**
 * @suluk/provision — declarative service provisioning for a Suluk app, modelled on the Open Service Broker API and
 * driven like drizzle-kit (C047). Declare the infra you want in one config; each service (Cloudflare D1/KV/R2/secrets,
 * Stripe, a domain, a scoped token) is an OSB {@link Broker} advertising a {@link Catalog} and answering provision /
 * bind / deprovision. `plan` diffs desired-vs-live (pure), `apply` walks the binding DAG (provision → poll async
 * last-operation → bind → land credentials in @suluk/env), `assertNoDrift` is the CI gate. This package is the OSB
 * *client* / orchestrator — a layer ABOVE @suluk/cloudflare / @suluk/deploy / @suluk/env, which it composes as brokers +
 * the binding sink. This barrel is the CORE framework; the concrete brokers + the CLI ship alongside it.
 */
export type {
  OperationState, ServicePlan, ServiceOffering, Catalog,
  InstanceSpec, InstanceState,
  ProvisionRequest, ProvisionResult, BindRequest, BindResult, OperationRequest,
  Broker, BindingSink, StateStore,
} from "./types";
export { defineProvision, type ProvisionConfig } from "./config";
export { topoOrder } from "./dag";
export { parseRef, depsOf, resolveParams, stableStringify, fingerprint } from "./refs";
export { plan, type ProvisionPlan, type PlanStep, type StepAction } from "./plan";
export { apply, type ApplyOptions, type ApplyResult, type AppliedStep } from "./apply";
export { checkDrift, assertNoDrift, type DriftReport } from "./check";
export { memoryStore, memorySink } from "./memory";
export { fileStore } from "./file-store";
export { envSink, type EnvSinkOptions } from "./env-sink";
// the concrete Cloudflare brokers (wrap @suluk/cloudflare's idempotent provisioners).
export { cloudflareD1, cloudflareKv, cloudflareR2, cloudflareSecrets } from "./brokers/cloudflare";
