/**
 * The declarative provision config (C047) — drizzle-kit's `drizzle.config.ts` for infrastructure. You list the instances
 * you want (each an OSB broker + name + plan + params + binding map); `plan`/`apply`/`check` are pure functions of THIS
 * plus live state. `defineProvision` validates the static shape (unique refs, an acyclic binding DAG) at authoring time,
 * so an unreferenceable ref or a binding loop is caught before any provider is called.
 */
import type { InstanceSpec } from "./types";
import { topoOrder } from "./dag";

export interface ProvisionConfig {
  /** the instances to provision (desired state). Order is free — the binding DAG decides apply order. */
  instances: InstanceSpec[];
  /** orphan mitigation default: deprovision instances in state but not in config. DEFAULT false (destructive — opt in
   *  here or per-apply). `apply --prune` / `check` honour it. */
  pruneOrphans?: boolean;
}

/** Validate + return a provision config. Throws on a duplicate ref, an undeclared-ref reference, or a binding cycle
 *  (via {@link topoOrder}) — all the static errors, surfaced before `apply` touches a provider. */
export function defineProvision(config: ProvisionConfig): ProvisionConfig {
  topoOrder(config.instances); // throws on dup ref / unknown ref / cycle
  return config;
}
