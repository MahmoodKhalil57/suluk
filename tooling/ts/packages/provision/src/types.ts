/**
 * The Open Service Broker API, recast as a TypeScript seam (C047). Each service a Suluk app needs (a Cloudflare D1
 * database, a KV namespace, an R2 bucket, Worker secrets, a Stripe account's products/webhooks, a custom domain, a
 * scoped token) is a {@link Broker} — it advertises a {@link Catalog}, then `provision` / `bind` / `deprovision` a
 * Service Instance, exactly the OSB lifecycle. The platform (this package) is the OSB *client*: it reads a declared
 * desired-state, diffs it against live state, and walks the brokers. Brokers are PURE of the orchestration — they hold
 * only their own provider call (e.g. @suluk/cloudflare's `provisionD1`), so the lifecycle logic can never drift per
 * service. See `spec.md` (the OSB v2 master) for the contract these types mirror.
 */

/** OSB last-operation state for an ASYNC provision/deprovision (a database that takes seconds, a cert that takes minutes). */
export type OperationState = "in progress" | "succeeded" | "failed";

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
  /** Deprovision (OSB): tear down the Service Instance. Optional — orphan mitigation + `apply --prune` call it. */
  deprovision?(req: OperationRequest): Promise<{ state: OperationState; operation?: string }>;
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
