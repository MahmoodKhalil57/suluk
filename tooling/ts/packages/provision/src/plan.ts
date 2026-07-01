/**
 * The diff (C047) — drizzle-kit's `generate`/diff for infrastructure: desired config × live state → a reviewable plan of
 * steps, in binding-DAG order. PURE: no provider calls, no clock. `apply` executes a plan; `check` asserts a plan is
 * empty (no drift). The four actions mirror the OSB verbs the executor will call.
 */
import type { InstanceSpec, InstanceState } from "./types";
import type { ProvisionConfig } from "./config";
import { topoOrder } from "./dag";
import { fingerprint } from "./refs";

export type StepAction = "create" | "update" | "noop" | "deprovision";

export interface PlanStep {
  ref: string;
  service: string;
  name: string;
  action: StepAction;
  /** human-readable cause: "new" | "params changed" | "up to date" | "orphan (in state, not in config)". */
  reason: string;
}

export interface ProvisionPlan {
  steps: PlanStep[];
  /** refs present in state but absent from config — deprovisioned only when pruning is on (else surfaced, not touched). */
  orphans: string[];
  /** true when every step is a noop and there are no (prunable) orphans — the `check` CI gate passes on this. */
  clean: boolean;
}

/** Diff `config` against `state`. Desired instances are emitted in binding-DAG order (create/update/noop); orphans
 *  (state − config) become `deprovision` steps only when `prune` (the config default, or an override) is on. */
export function plan(config: ProvisionConfig, state: InstanceState[], prune = config.pruneOrphans ?? false): ProvisionPlan {
  const byRef = new Map(state.map((s) => [s.ref, s]));
  const declared = new Set(config.instances.map((i) => i.ref));
  const ordered = topoOrder(config.instances);

  const steps: PlanStep[] = ordered.map((spec: InstanceSpec) => {
    const prior = byRef.get(spec.ref);
    if (!prior) return { ref: spec.ref, service: spec.service, name: spec.name, action: "create", reason: "new" };
    if (prior.fingerprint !== fingerprint(spec) || prior.name !== spec.name) {
      return { ref: spec.ref, service: spec.service, name: spec.name, action: "update", reason: "params changed" };
    }
    return { ref: spec.ref, service: spec.service, name: spec.name, action: "noop", reason: "up to date" };
  });

  const orphans = state.filter((s) => !declared.has(s.ref)).map((s) => s.ref);
  if (prune) {
    for (const ref of orphans) {
      const s = byRef.get(ref)!;
      // a PROTECTED orphan is surfaced but NOT scheduled for destruction — the prevent-destroy safety rail.
      if (s.protected) steps.push({ ref, service: s.service, name: s.name, action: "noop", reason: "orphan but protected — kept" });
      else steps.push({ ref, service: s.service, name: s.name, action: "deprovision", reason: "orphan (in state, not in config)" });
    }
  }

  // "clean" ignores protected-orphan noops (they're intentionally kept, not pending work).
  const prunable = prune ? orphans.filter((ref) => !byRef.get(ref)?.protected) : [];
  const clean = steps.every((s) => s.action === "noop") && prunable.length === 0;
  return { steps, orphans, clean };
}
