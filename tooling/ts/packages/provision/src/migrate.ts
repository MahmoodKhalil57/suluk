/**
 * `migrate` (C047) — drizzle-kit's `migrate` for infrastructure. Runs the PENDING migrations (those not in this
 * environment's applied-ledger) in index order, marking each applied — so the same committed history brings any
 * environment (prod, preview, a fresh account) to the same state, repeatably. Each migration is executed by replaying its
 * SNAPSHOT as the desired state through `apply` (pruning, so a migration's deprovision runs; `protected` still guards) —
 * which REUSES the whole engine: the binding chain, async last-operation polling, the sink. The migration's step list is
 * the documented record; the snapshot is what actually executes.
 */
import type { Broker, BindingSink, StateStore } from "./types";
import type { MigrationStore } from "./migration-store";
import type { PollOptions } from "./poll";
import { apply } from "./apply";

export interface MigrateOptions {
  brokers: Record<string, Broker>;
  /** the live journal (InstanceState). */
  store: StateStore;
  /** the committed migrations + this env's applied-ledger. */
  migrations: MigrationStore;
  sink?: BindingSink;
  poll?: PollOptions;
  log?: (msg: string) => void;
}

export interface MigrateResult {
  applied: number[];
  upToDate: boolean;
}

export async function migrate(opts: MigrateOptions): Promise<MigrateResult> {
  const log = opts.log ?? (() => {});
  const all = await opts.migrations.listMigrations();
  const done = new Set(await opts.migrations.applied());
  const pending = all.filter((m) => !done.has(m.idx));
  if (!pending.length) {
    log("✓ migrations up to date");
    return { applied: [], upToDate: true };
  }
  const applied: number[] = [];
  for (const m of pending) {
    const snap = await opts.migrations.loadSnapshot(m.idx);
    if (!snap) throw new Error(`provision: migration ${m.tag} has no snapshot`);
    log(`▸ ${m.tag} (${m.steps.length} step${m.steps.length === 1 ? "" : "s"})`);
    // replay the snapshot as the desired state; prune so a dropped instance in this migration is deprovisioned (protected
    // still guards). apply is idempotent, so a re-run after a mid-migration failure resumes cleanly.
    await apply({ instances: snap.instances, pruneOrphans: true }, { brokers: opts.brokers, store: opts.store, sink: opts.sink, poll: opts.poll, log: opts.log });
    await opts.migrations.markApplied(m.idx);
    applied.push(m.idx);
  }
  return { applied, upToDate: false };
}
