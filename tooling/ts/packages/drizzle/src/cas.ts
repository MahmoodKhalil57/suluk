/**
 * Once-only WRITE primitives — the concurrency-correctness skeleton a money/state-machine path needs, made
 * driver-agnostic. `rowsChanged` normalizes the affected-row count across drivers (bun:sqlite `.changes`, D1
 * `.meta.changes`, others `.rowsAffected`); `claimOnce` runs a CONDITIONAL update and reports whether THIS call
 * won the transition (changed a row) — the compare-and-set that makes "pending→paid", "paid→refunded", an
 * atomic latch flip, or a claim-then-notify sweep fire exactly once under concurrent delivery. The state machine
 * (which transitions, which side-effects) stays in the app; this owns only the race-safe claim, behind a port.
 */
import type { SQL } from "drizzle-orm";

/** A drizzle `.run()` result across drivers (bun:sqlite / D1 / better-sqlite3). */
export type WriteResult = { changes?: number; rowsAffected?: number; meta?: { changes?: number } } | unknown;

/** The number of rows a write affected, normalized across drivers (0 when unknown). */
export function rowsChanged(result: WriteResult): number {
  const r = result as { changes?: number; rowsAffected?: number; meta?: { changes?: number } } | null | undefined;
  return Number(r?.meta?.changes ?? r?.changes ?? r?.rowsAffected ?? 0) || 0;
}

/** Minimal drizzle handle for a conditional update (bun:sqlite sync or D1 async — both awaited). */
export interface ClaimDb { update: (table: unknown) => { set: (values: Record<string, unknown>) => { where: (cond: SQL) => { run: () => unknown | Promise<unknown>; returning: () => unknown | Promise<unknown> } } } }

/**
 * Atomically CLAIM a transition: `UPDATE table SET set WHERE where`, returning true iff this call changed a row.
 * The `where` MUST include the FROM-state guard (e.g. `and(eq(id, n), eq(status, "pending"))`) so a re-delivery /
 * concurrent caller finds the row already transitioned and changes nothing → returns false. The single point that
 * makes a once-only side-effect (charge, refund, decrement, email) safe to run when, and only when, the claim wins.
 */
export async function claimOnce(db: ClaimDb, table: unknown, where: SQL, set: Record<string, unknown>): Promise<boolean> {
  const res = await db.update(table).set(set).where(where).run();
  return rowsChanged(res) > 0;
}

/**
 * Atomically CLAIM a SET of rows and RETURN them: `UPDATE table SET set WHERE where RETURNING *`. The claim-then-act
 * variant of {@link claimOnce} — for a batch sweep (mark a waitlist notified / a cart-recovery emailed) where each
 * row must be handled exactly once even if the sweep overlaps: a concurrent run's UPDATE claims a DISJOINT set, so
 * the side-effect (email, notify) fires once per row. Returns the rows THIS call won; act only on those.
 */
export async function claimRows<T = Record<string, unknown>>(db: ClaimDb, table: unknown, where: SQL, set: Record<string, unknown>): Promise<T[]> {
  return (await db.update(table).set(set).where(where).returning()) as T[];
}
