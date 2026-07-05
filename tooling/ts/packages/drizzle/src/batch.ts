/**
 * ATOMIC multi-statement writes — the cross-driver-SAFE alternative to `db.transaction()`. `db.transaction()` is
 * NOT exposed as a Suluk primitive: drizzle-orm's D1 driver implements it as separate `BEGIN`/`COMMIT` (and
 * `SAVEPOINT`) statements — each its own `.run()` round-trip — but Cloudflare D1 is a stateless HTTP RPC surface
 * with no session tying two calls together, so `BEGIN` is a no-op, nothing is isolated in between, and `COMMIT`
 * commits nothing. It throws at runtime on real D1 ("please use state.storage.transaction()... instead of BEGIN
 * TRANSACTION"). Worse, this stack's OWN local-dev shim (`@suluk/cloudflare`'s `d1FromSqlite`) runs on a REAL,
 * persistent `bun:sqlite` connection, so `db.transaction()` silently APPEARS to work in dev and only breaks once
 * deployed — `guardTransactions` closes that trap by failing the same way everywhere. `atomicBatch` wraps
 * `db.batch()` instead — Cloudflare's actually-supported atomicity primitive: every statement travels in ONE
 * request, so D1 (and the dev shim, and libSQL) can wrap them in one real all-or-nothing unit with no cross-call
 * session required. The tradeoff: every statement must be fully built up front — no reading an intermediate
 * result to decide the next one. For a conditional read-then-write, reach for `cas.ts`'s `claimOnce`/`claimRows`
 * instead (a single conditional `UPDATE ... RETURNING` is already atomic on its own — no batch needed).
 */
import type { BatchItem, BatchResponse } from "drizzle-orm/batch";

/** The slice of a drizzle D1 db that supports `.batch()` (same shape libSQL exposes). */
export interface BatchDb {
  batch<U extends BatchItem<"sqlite">, T extends Readonly<[U, ...U[]]>>(statements: T): Promise<BatchResponse<T>>;
}

/**
 * Run 2+ already-built statements (`db.insert(...)`, `db.update(...)...`, `db.select()...`, `db.delete(...)`) in ONE
 * atomic round trip — fewer Worker↔D1 requests than running them sequentially (cheaper by construction, never
 * more expensive than the naive sequential form it replaces), and genuinely all-or-nothing on both D1 and the
 * local dev shim. Named so it reads at the call site as the deliberate, safe choice — a thin pass-through over
 * `db.batch`, not new machinery.
 */
export function atomicBatch<U extends BatchItem<"sqlite">, T extends Readonly<[U, ...U[]]>>(
  db: BatchDb,
  statements: T,
): Promise<BatchResponse<T>> {
  return db.batch(statements);
}

/**
 * Disable `db.transaction()` on a drizzle db instance — shadows the (prototype) method with one own-property that
 * throws immediately, in dev and prod alike. Only `transaction` is touched; every other method (select/insert/
 * update/delete/batch/query/...) is untouched on the SAME real instance, so no proxy/`this`-rebinding risk.
 */
export function guardTransactions<T extends object>(db: T): T {
  Object.defineProperty(db, "transaction", {
    configurable: true,
    enumerable: false,
    value: () => {
      throw new Error(
        "db.transaction() is disabled: it silently 'works' against the local bun:sqlite dev shim but throws on " +
          "real Cloudflare D1 (stateless HTTP — no session ties BEGIN to COMMIT across separate calls). Use " +
          "atomicBatch(db, [...]) for multi-statement atomicity (every statement built up front), or " +
          "claimOnce/claimRows for a conditional single-statement read-then-write (already atomic on its own).",
      );
    },
  });
  return db;
}
