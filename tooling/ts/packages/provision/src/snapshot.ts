/**
 * Snapshots (C047) — drizzle-kit's `meta/NNNN_snapshot.json` for infrastructure. A snapshot is the point-in-time DESIRED
 * state (the config's instances) at a given migration index. `generate` diffs the last snapshot against the current
 * config to compute the next migration; `migrate` replays a snapshot as the desired state. Committed to git, snapshots
 * make every infra change a repeatable, reviewable record — the same discipline as SQL migration snapshots.
 */
import type { InstanceSpec } from "./types";
import type { ProvisionConfig } from "./config";

export const SNAPSHOT_VERSION = "1";

export interface Snapshot {
  version: string;
  /** the migration index this snapshot represents (−1 = the empty pre-history state). */
  idx: number;
  instances: InstanceSpec[];
}

/** The empty baseline — the "before the first migration" state, so the first `generate` diffs against nothing. */
export const EMPTY_SNAPSHOT: Snapshot = { version: SNAPSHOT_VERSION, idx: -1, instances: [] };

/** A snapshot of `config` at migration `idx`. */
export function snapshot(idx: number, config: ProvisionConfig): Snapshot {
  return { version: SNAPSHOT_VERSION, idx, instances: config.instances };
}
