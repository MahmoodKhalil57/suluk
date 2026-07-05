/**
 * The Open Service Broker API, as a TypeScript source-of-truth (C047). This file carries ONE layer now:
 *
 *  THE BROKER SEAM (the framework's client-side abstraction) — each service a Suluk app needs (a Cloudflare D1
 *  database, a KV namespace, an R2 bucket, Worker secrets, a Stripe account's products/webhooks, a custom domain, a
 *  scoped token) is a {@link Broker}: it advertises a {@link Catalog}, then `provision` / `bind` / `deprovision` a
 *  Service Instance, exactly the OSB lifecycle. The platform (this package) is the OSB *client* — it reads a declared
 *  desired-state, diffs it against live state, and walks the brokers. Brokers are PURE of the orchestration (they
 *  hold only their own provider call, e.g. @suluk/cloudflare's `provisionD1`), so lifecycle logic never drifts per
 *  service. These are the types the framework code imports ({@link InstanceSpec}, {@link Broker}, {@link StateStore}…).
 *
 * **C101 — the OSB v2 WIRE CONTRACT moved to `@suluk/core`.** Every request/response body and supporting object of the
 * Open Service Broker API v2 (grounded in `spec.md` + the projected `openapiv4.json`) now lives in `@suluk/core`'s
 * `types.ts` as a non-normative companion model — the same "reference the standard, no dep" treatment core already
 * gives JSON Schema (C099) and CloudEvents/AsyncAPI (C100). Re-exported below (byte-identical) so every existing
 * import of this package keeps working. The seam above is the framework's OWN reduced view of that wire contract (see
 * the cross-links in each seam type's doc comment) — it does NOT move, the same way `@suluk/hono`'s `emitAsyncApi`
 * projection logic stayed put while its wire types moved to core. NEW: {@link deriveInstanceSpecs} (`./derive`)
 * projects a v4 document's `x-suluk-provision` facet (the light "broker intent" annotation, `@suluk/core`'s
 * `SulukProvisionInstance`) into this file's own {@link InstanceSpec}[] — "author domain once, generate OSB artifacts."
 *
 * See `spec.md` (the OSB v2 master) for the normative contract the re-exported types mirror.
 */
import type { OperationState } from "@suluk/core";
export type { OperationState } from "@suluk/core";

/** A plan tier within an offering (OSB Service Plan). Most infra has a single "standard" plan; `free` marks $0 tiers. */
export interface ServicePlan {
  id: string;
  name: string;
  description?: string;
  free?: boolean;
}

/** What a broker can provision (OSB Service Offering). `bindable` = provisioning yields credentials/config to bind. */
export interface ServiceOffering {
  /** the stable broker id used in a config's `service`, e.g. "cloudflare-d1". */
  id: string;
  name: string;
  description: string;
  bindable: boolean;
  plans: ServicePlan[];
}

/** The set of offerings a broker advertises (OSB Catalog). */
export interface Catalog {
  services: ServiceOffering[];
}

/** A declared instance the platform WANTS (the desired state — one entry in provision.config). */
export interface InstanceSpec {
  /** a unique handle within the config, referenced by other instances' params (e.g. "db", "kv-sessions"). */
  ref: string;
  /** the broker id that provisions it (must match a catalog offering's id), e.g. "cloudflare-d1". */
  service: string;
  /** the plan id; defaults to the offering's first plan. */
  plan?: string;
  /** the provider-facing name, e.g. "toolfactory-db". */
  name: string;
  /** provision params (broker-specific). A string value of the form `@<ref>.<key>` is a BINDING REFERENCE, resolved at
   *  apply time from that producer instance's outputs — this is what wires the provisioning DAG. */
  params?: Record<string, unknown>;
  /** binding outputs → env var names: where this instance's credentials/ids LAND (the binding-chain sink). e.g.
   *  `{ database_id: "CLOUDFLARE_D1_ID" }`. */
  bind?: Record<string, string>;
  /** guard a stateful resource (a database, a bucket) from destruction: `prune` + `teardown` SKIP it unless forced.
   *  The terraform `prevent_destroy` analog — the safety rail for the resources whose loss is unrecoverable. */
  protected?: boolean;
}

/** The live record of a provisioned instance (the journal `plan` diffs against — like drizzle's migration meta). */
export interface InstanceState {
  ref: string;
  service: string;
  plan?: string;
  name: string;
  /** the provider's instance id (e.g. the D1 uuid, the KV namespace id). */
  instanceId: string;
  /** the binding outputs captured at provision/bind time (so downstream refs resolve without re-calling the provider). */
  outputs: Record<string, string>;
  /** a stable fingerprint of (name + plan + params), to detect drift → an `update` step. */
  fingerprint: string;
  /** carried from the spec so `teardown`/`prune` (which work off the journal) honour the destroy guard. */
  protected?: boolean;
  provisionedAt: number;
}

/** The resolved request handed to a broker's `provision` (param refs already substituted). */
export interface ProvisionRequest {
  ref: string;
  name: string;
  plan?: string;
  params: Record<string, unknown>;
}

/** A broker's provision outcome — sync (ready now) or async (poll `lastOperation` with `operation`). An async ack MAY
 *  already carry `outputs` (e.g. a D1 create returns the database_id immediately even though the DB takes a moment to be
 *  queryable); they're threaded once the op settles, alongside any from `bind`. */
export type ProvisionResult =
  | { state: "succeeded"; instanceId: string; outputs?: Record<string, string> }
  | { state: "in progress"; operation: string; instanceId?: string; outputs?: Record<string, string> };

/** The resolved request handed to a broker's `bind`. */
export interface BindRequest {
  ref: string;
  name: string;
  instanceId: string;
  params: Record<string, unknown>;
}

/** A broker's bind outcome — the credentials/config the platform + downstream instances consume. */
export interface BindResult {
  outputs: Record<string, string>;
}

/** The request handed to `lastOperation` / `deprovision`. */
export interface OperationRequest {
  ref: string;
  name: string;
  instanceId?: string;
  operation: string;
}

/**
 * The OSB-shaped broker every service implements. Provision MUST be idempotent (re-running reconciles, never duplicates —
 * OSB's "200 vs 201" rule). `lastOperation`/`bind`/`deprovision` are optional: a synchronous, non-bindable, or
 * never-torn-down service simply omits them.
 */
export interface Broker {
  /** OSB Catalog — what this broker can provision. */
  catalog(): Catalog | Promise<Catalog>;
  /** Provision (idempotent): create the Service Instance, or reconcile an existing one. Sync or async. */
  provision(req: ProvisionRequest): Promise<ProvisionResult>;
  /** Poll an async provision (OSB last-operation). Required only for brokers that return `state: "in progress"`. */
  lastOperation?(req: OperationRequest): Promise<{ state: OperationState; description?: string }>;
  /** Bind (OSB): generate the credentials / config the platform + downstream instances consume. Optional (non-bindable). */
  bind?(req: BindRequest): Promise<BindResult>;
  /** Deprovision (OSB): tear down the Service Instance. Optional — orphan mitigation, `apply --prune`, + `teardown` call it. */
  deprovision?(req: OperationRequest): Promise<{ state: OperationState; operation?: string }>;
  /** Fetch a Service Instance (OSB): the live state of a KNOWN instance — used by `pull` to detect EXTERNAL drift (a
   *  resource deleted/changed in the provider's dashboard, behind the config's back). Optional; absent → "unknown". */
  fetch?(req: OperationRequest): Promise<{ exists: boolean; outputs?: Record<string, string> }>;
  /** Discover existing instances of this service — used by `pull --discover` to ADOPT untracked resources into the
   *  journal. Optional; absent → discovery skipped for this service. */
  list?(): Promise<Array<{ name: string; instanceId: string; outputs?: Record<string, string> }>>;
}

/** Where bound credentials LAND. The default sink writes the @suluk/env manifest (typed + post-quantum-encrypted +
 *  commit-safe); a test passes an in-memory sink. `mapping` is the instance's `bind` (output key → env var name). */
export interface BindingSink {
  write(outputs: Record<string, string>, mapping: Record<string, string>): Promise<void> | void;
}

/** The persisted provision journal (desired-vs-live diffing). The default store is a JSON file; a test passes memory. */
export interface StateStore {
  load(): Promise<InstanceState[]> | InstanceState[];
  save(state: InstanceState[]): Promise<void> | void;
}

/* ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
 * THE OSB v2 WIRE CONTRACT — re-exported from `@suluk/core` (C101).
 *
 * Every request/response body and supporting object of the Open Service Broker API v2 now lives in `@suluk/core`
 * (grounded in `spec.md` + the projected `openapiv4.json`, same as before — only the file moved). Field NAMES are
 * still the wire names (snake_case), verbatim from the spec; two schema names are still renamed to avoid shadowing a
 * TypeScript/JS global or this package's own seam name — OSB `Object` → {@link JsonObject}, OSB `Error` →
 * {@link ServiceBrokerError}, OSB `Catalog` → {@link CatalogResponse} (to avoid this file's own {@link Catalog}).
 * ════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
export type {
  JsonObject, Context, Metadata, MaintenanceInfo, DashboardClient,
  Schemas, ServiceInstanceSchema, ServiceBindingSchema, ServiceRequires,
  Plan, Service, CatalogResponse, ServiceInstanceMetadata,
  ServiceInstanceProvisionRequestBody, ServiceInstanceProvisionResponse, ServiceInstanceAsyncOperation,
  ServiceInstanceUpdateRequestBody, ServiceInstancePreviousValues, ServiceInstanceResource,
  AsyncOperation, LastOperationResource,
  ServiceBindingResouceObject, ServiceBindingRequest, ServiceBindingMetadata, ServiceBindingEndpoint,
  ServiceBindingVolumeMountDevice, ServiceBindingVolumeMount, ServiceBindingResponse, ServiceBindingResource,
  ServiceBrokerError,
} from "@suluk/core";
