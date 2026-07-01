/**
 * Teardown (C047) — the destructive op: deprovision EVERY journaled instance, CONSUMERS-FIRST (reverse of the journal's
 * provision order), so a producer is never removed while a consumer still references it. The careful rails: a `protected`
 * instance (a database, a bucket — a resource whose loss is unrecoverable) is SKIPPED unless `force`; a broker with no
 * `deprovision` is skipped (kept); an async teardown is polled to done. The CLI additionally gates this behind an explicit
 * confirmation — `teardown` alone previews, `teardown --yes` executes. Returns what was torn down + what was kept.
 */
import type { Broker, InstanceState, StateStore } from "./types";
import { pollToDone, type PollOptions } from "./poll";

export interface TeardownOptions {
  brokers: Record<string, Broker>;
  store: StateStore;
  /** override the `protected` rail — required to destroy a protected instance. */
  force?: boolean;
  /** preview only: compute the order + honour the rails, but call NO provider + don't save. The confirmation default. */
  dryRun?: boolean;
  log?: (msg: string) => void;
  poll?: PollOptions;
}

export interface TeardownResult {
  /** refs deprovisioned (or, under dryRun, that WOULD be). */
  torn: string[];
  /** refs kept + why: protected (no force) or the broker can't deprovision. */
  kept: { ref: string; reason: string }[];
  /** the remaining journal after teardown (the kept instances). */
  state: InstanceState[];
}

/** Deprovision the whole journal, consumers-first, honouring `protected`. Destructive — gate it behind confirmation. */
export async function teardown(opts: TeardownOptions): Promise<TeardownResult> {
  const log = opts.log ?? (() => {});
  const poll = opts.poll ?? {};
  const state = await opts.store.load();
  const torn: string[] = [];
  const kept: { ref: string; reason: string }[] = [];
  const keptState: InstanceState[] = [];

  // reverse journal order ≈ consumers before producers (the journal is written in provision/DAG order).
  for (const s of [...state].reverse()) {
    if (s.protected && !opts.force) {
      kept.push({ ref: s.ref, reason: "protected" });
      keptState.push(s);
      log(`• kept ${s.ref} (protected — pass --force to destroy)`);
      continue;
    }
    const broker = opts.brokers[s.service];
    if (!broker?.deprovision) {
      kept.push({ ref: s.ref, reason: "no deprovision" });
      keptState.push(s);
      log(`• kept ${s.ref} (${s.service} has no deprovision)`);
      continue;
    }
    if (opts.dryRun) {
      torn.push(s.ref);
      log(`  - would tear down ${s.ref} (${s.name})`);
      continue;
    }
    const res = await broker.deprovision({ ref: s.ref, name: s.name, instanceId: s.instanceId, operation: "deprovision" });
    if (res.state === "in progress") await pollToDone(broker, { ref: s.ref, name: s.name, instanceId: s.instanceId, operation: res.operation ?? "deprovision" }, poll, log);
    torn.push(s.ref);
    log(`✗ torn down ${s.ref} (${s.name})`);
  }

  const finalState = keptState.reverse(); // restore journal (provision) order
  if (!opts.dryRun) await opts.store.save(finalState);
  return { torn, kept, state: finalState };
}
