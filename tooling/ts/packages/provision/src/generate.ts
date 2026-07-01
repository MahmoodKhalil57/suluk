/**
 * `generate` (C047) — drizzle-kit's `generate` for infrastructure. Diffs the current config against the last committed
 * snapshot; if anything changed, writes the next migration (the ordered delta) + its snapshot and appends the journal.
 * Pure of any provider — this only records the intended change (repeatable + reviewable in a PR); `migrate` applies it.
 * Returns the migration, or null when the config already matches the last snapshot (nothing to generate).
 */
import type { ProvisionConfig } from "./config";
import type { MigrationStore } from "./migration-store";
import { diffSnapshots, migrationTag, type Migration } from "./migration";
import { snapshot } from "./snapshot";

export async function generate(config: ProvisionConfig, store: MigrationStore, name?: string): Promise<Migration | null> {
  const prev = await store.lastSnapshot();
  const steps = diffSnapshots(prev, config);
  if (!steps.length) return null; // config == last snapshot → nothing to record
  const idx = prev.idx + 1;
  const migration: Migration = { idx, tag: migrationTag(idx, name), steps };
  await store.write(migration, snapshot(idx, config));
  return migration;
}
