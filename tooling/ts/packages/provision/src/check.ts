/**
 * The drift gate (C047) — drizzle-kit's `check` for infrastructure. `checkDrift` diffs config against the journal and
 * returns the non-noop steps; `assertNoDrift` throws when any exist. Compose it into a CI gate (or @suluk/cockpit
 * conformance) so a PR that adds an instance to the config without provisioning it, or leaves an orphan behind, fails.
 */
import type { InstanceState } from "./types";
import type { ProvisionConfig } from "./config";
import { plan, type PlanStep } from "./plan";

export interface DriftReport {
  clean: boolean;
  /** the steps that would change something (create/update/deprovision) — empty when in sync. */
  drift: PlanStep[];
  orphans: string[];
}

/** Report whether live state matches the config (orphans counted only when pruning is the config default). */
export function checkDrift(config: ProvisionConfig, state: InstanceState[]): DriftReport {
  const p = plan(config, state);
  return { clean: p.clean, drift: p.steps.filter((s) => s.action !== "noop"), orphans: p.orphans };
}

/** Fail-closed: throw when there's any drift (the CI gate). */
export function assertNoDrift(config: ProvisionConfig, state: InstanceState[]): void {
  const r = checkDrift(config, state);
  if (!r.clean) {
    const lines = r.drift.map((s) => `  ${s.action} ${s.ref} (${s.reason})`);
    if (r.orphans.length) lines.push(`  orphans: ${r.orphans.join(", ")}`);
    throw new Error(`provision: infrastructure drift detected\n${lines.join("\n")}`);
  }
}
