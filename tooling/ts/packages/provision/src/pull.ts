/**
 * Introspection (C047) — drizzle-kit's `pull` for infrastructure, over OSB's "Fetching a Service Instance". `plan`
 * compares the config to the JOURNAL (what we believe is live); `pull` compares the journal to the PROVIDER (what's
 * actually live), catching EXTERNAL drift — a database dropped in the dashboard, a token revoked out of band, an id that
 * changed behind the config's back. `reconcile` folds a report back into the journal; `discover` finds untracked
 * resources to adopt. All read-only against the journal — the caller persists the reconciled state.
 */
import type { Broker, InstanceState, OperationRequest } from "./types";

export type PullStatus = "live" | "missing" | "drifted" | "unknown";

export interface PullEntry {
  ref: string;
  service: string;
  name: string;
  instanceId: string;
  /** live = present + matches · missing = gone from the provider · drifted = present but outputs changed · unknown = the
   *  broker has no `fetch`, so we couldn't check. */
  status: PullStatus;
  liveOutputs?: Record<string, string>;
}

export interface PullReport {
  entries: PullEntry[];
  /** journaled refs whose live resource is GONE (deleted outside the config) — the next `apply` re-creates them. */
  missing: string[];
  /** journaled refs whose live outputs differ from the journal. */
  drifted: string[];
  /** nothing missing or drifted (unknowns don't count — we couldn't verify them). */
  clean: boolean;
}

/** Compare only the keys the live fetch reported (it may return a subset of the journal's outputs). */
function outputsMatch(live: Record<string, string>, journal: Record<string, string>): boolean {
  return Object.keys(live).every((k) => live[k] === journal[k]);
}

/** Fetch each journaled instance's live state via its broker (OSB fetch) → an external-drift report. Read-only. */
export async function pull(state: InstanceState[], brokers: Record<string, Broker>): Promise<PullReport> {
  const entries: PullEntry[] = [];
  for (const s of state) {
    const broker = brokers[s.service];
    const base = { ref: s.ref, service: s.service, name: s.name, instanceId: s.instanceId };
    if (!broker?.fetch) {
      entries.push({ ...base, status: "unknown" });
      continue;
    }
    const req: OperationRequest = { ref: s.ref, name: s.name, instanceId: s.instanceId, operation: "fetch" };
    const live = await broker.fetch(req);
    if (!live.exists) {
      entries.push({ ...base, status: "missing" });
      continue;
    }
    const drifted = !!live.outputs && !outputsMatch(live.outputs, s.outputs);
    entries.push({ ...base, status: drifted ? "drifted" : "live", liveOutputs: live.outputs });
  }
  const missing = entries.filter((e) => e.status === "missing").map((e) => e.ref);
  const drifted = entries.filter((e) => e.status === "drifted").map((e) => e.ref);
  return { entries, missing, drifted, clean: missing.length === 0 && drifted.length === 0 };
}

/** Fold a pull report into the journal: DROP externally-deleted instances (so the next `apply` re-creates them) + MERGE
 *  live outputs over drifted ones (never dropping a bound value the provider doesn't know, e.g. a minted token). Pure —
 *  returns the reconciled state; the caller saves it. */
export function reconcile(state: InstanceState[], report: PullReport): InstanceState[] {
  const missing = new Set(report.missing);
  const liveByRef = new Map(report.entries.filter((e) => e.liveOutputs).map((e) => [e.ref, e.liveOutputs!]));
  return state
    .filter((s) => !missing.has(s.ref))
    .map((s) => (liveByRef.has(s.ref) ? { ...s, outputs: { ...s.outputs, ...liveByRef.get(s.ref)! } } : s));
}

export interface DiscoveredInstance {
  service: string;
  name: string;
  instanceId: string;
  outputs?: Record<string, string>;
}

/** Discover live instances (via `broker.list`) that AREN'T in the journal — untracked resources to adopt (`pull
 *  --discover`). Skips services whose broker has no `list`. */
export async function discover(state: InstanceState[], brokers: Record<string, Broker>): Promise<DiscoveredInstance[]> {
  const known = new Set(state.map((s) => `${s.service}:${s.instanceId}`));
  const found: DiscoveredInstance[] = [];
  for (const [service, broker] of Object.entries(brokers)) {
    if (!broker.list) continue;
    for (const inst of await broker.list()) {
      if (!known.has(`${service}:${inst.instanceId}`)) found.push({ service, name: inst.name, instanceId: inst.instanceId, outputs: inst.outputs });
    }
  }
  return found;
}
