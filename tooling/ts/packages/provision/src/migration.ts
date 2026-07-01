/**
 * Migrations (C047) — drizzle-kit's `NNNN_name.sql` for infrastructure: the DELTA between two snapshots, as an ordered,
 * human-readable list of steps (create/update/deprovision). A migration is documentable (committed JSON, reviewable in a
 * PR) and repeatable (its snapshot replays to the same state). `diffSnapshots` computes it: creates/updates in
 * binding-DAG order (a producer before its consumer), deprovisions in reverse (a consumer before its producer).
 */
import type { InstanceSpec } from "./types";
import type { ProvisionConfig } from "./config";
import type { Snapshot } from "./snapshot";
import { topoOrder } from "./dag";
import { fingerprint } from "./refs";

export interface MigrationStep {
  action: "create" | "update" | "deprovision";
  ref: string;
  service: string;
  name: string;
  /** the full spec for a create/update (so the migration is self-describing); absent for a deprovision. */
  spec?: InstanceSpec;
}

export interface Migration {
  idx: number;
  /** the file stem, e.g. "0000_initial". */
  tag: string;
  steps: MigrationStep[];
}

/** `NNNN_name` — the zero-padded migration tag. */
export const migrationTag = (idx: number, name = "migration"): string => `${String(idx).padStart(4, "0")}_${name}`;

/** Diff the previous snapshot against the next (current) config → the ordered migration steps. Creates + updates come in
 *  binding-DAG order (producers first); deprovisions of dropped instances come last, in reverse (consumers first). */
export function diffSnapshots(prev: Snapshot, next: ProvisionConfig): MigrationStep[] {
  const prevByRef = new Map(prev.instances.map((i) => [i.ref, i]));
  const nextByRef = new Map(next.instances.map((i) => [i.ref, i]));
  const steps: MigrationStep[] = [];

  for (const spec of topoOrder(next.instances)) {
    const before = prevByRef.get(spec.ref);
    if (!before) steps.push({ action: "create", ref: spec.ref, service: spec.service, name: spec.name, spec });
    else if (fingerprint(before) !== fingerprint(spec) || before.name !== spec.name) steps.push({ action: "update", ref: spec.ref, service: spec.service, name: spec.name, spec });
  }
  for (const prevSpec of [...prev.instances].reverse()) {
    if (!nextByRef.has(prevSpec.ref)) steps.push({ action: "deprovision", ref: prevSpec.ref, service: prevSpec.service, name: prevSpec.name });
  }
  return steps;
}
