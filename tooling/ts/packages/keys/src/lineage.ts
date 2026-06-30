/**
 * The lineage-tree DB ops (C046) — the materialized-path queries over a key delegation tree, plus the POOLED headroom
 * query that joins the credit ledger (where @suluk/keys meets @suluk/credits). The package OWNS the `key_lineage` schema;
 * the app injects a Drizzle handle. The grant-fetch that builds a ChainNode[] is app-specific (apikey vs MCP tables), so
 * it stays in the app and calls the pure algebra (chain.ts); these are the generic, table-owned operations. Extracted
 * verbatim from the source.
 */
import { and, eq, lt, sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { creditKey, creditTransaction } from "@suluk/credits";
import { type ChainNode, type Headroom, pooledHeadroom, topCappedPath } from "./chain";
import { subtreeLikePattern } from "./path";

/** The injected DB handle (drizzle/d1 in prod; bun:sqlite bridged in tests). */
export type KeysDB = DrizzleD1Database;

/** The delegation tree: each node's parent + a materialized `path` of keyIds (root→…→self). `userId`/`keyId` are plain
 *  columns (the app owns the user + apikey tables); `keyId` is the SAME string as `credit_key.keyId`. */
export const keyLineage = sqliteTable("key_lineage", {
  keyId: text("keyId").primaryKey(),
  parentKeyId: text("parentKeyId"),
  userId: text("userId").notNull(),
  path: text("path").notNull(),
  depth: integer("depth").notNull(),
});

/** SQL: "`key_lineage.path` is within <path>'s subtree" — self (exact) OR a descendant (escaped LIKE prefix). */
const subtreeSql = (path: string) => sql`(${keyLineage.path} = ${path} OR ${keyLineage.path} LIKE ${subtreeLikePattern(path)} ESCAPE '\\')`;

/** The keyIds in a node's subtree (itself + every descendant) — for cascade revoke. Falls back to `[keyId]` for a
 *  legacy caller with no lineage row (a childless root). */
export async function subtreeOf(db: KeysDB, keyId: string): Promise<string[]> {
  const self = await db.select({ path: keyLineage.path }).from(keyLineage).where(eq(keyLineage.keyId, keyId)).limit(1);
  const path = self[0]?.path ?? keyId;
  const rows = await db.select({ keyId: keyLineage.keyId }).from(keyLineage).where(subtreeSql(path));
  const ids = rows.map((r) => r.keyId);
  return ids.length ? ids : [keyId];
}

/** A parent's materialized path (for building a child's path). A parent with no row is a root → its bare id; a null
 *  parent (a session/account caller) → null (the child is a root). */
export async function parentPathOf(db: KeysDB, parentKeyId: string | null): Promise<string | null> {
  if (parentKeyId == null) return null;
  const rows = await db.select({ path: keyLineage.path }).from(keyLineage).where(eq(keyLineage.keyId, parentKeyId)).limit(1);
  return rows[0]?.path ?? parentKeyId;
}

/** Record a freshly-minted child (or root, when parentKeyId is null) in the lineage tree. Idempotent on the keyId PK. */
export async function insertLineage(db: KeysDB, opts: { keyId: string; parentKeyId: string | null; userId: string; parentPath: string | null }): Promise<void> {
  const path = opts.parentPath ? `${opts.parentPath}/${opts.keyId}` : opts.keyId;
  const depth = path.split("/").length - 1;
  await db.insert(keyLineage).values({ keyId: opts.keyId, parentKeyId: opts.parentKeyId, userId: opts.userId, path, depth }).onConflictDoNothing().run();
}

/**
 * The chain's POOLED credit headroom — one grouped query over the TOPMOST capped node's subtree (joining the credit
 * ledger via the `credit_key` sidecar), then {@link pooledHeadroom}. This is where the abuse-proof cap becomes real: a
 * parent's cap bounds its whole subtree's spend. Null when no node in the chain declares a cap (uncapped).
 */
export async function chainHeadroom(db: KeysDB, chain: ChainNode[]): Promise<Headroom | null> {
  const top = topCappedPath(chain);
  if (top == null) return null;
  const rows = await db
    .select({ path: keyLineage.path, spent: sql<number>`coalesce(sum(-${creditTransaction.delta}), 0)` })
    .from(keyLineage)
    .innerJoin(creditKey, eq(creditKey.keyId, keyLineage.keyId))
    .innerJoin(creditTransaction, eq(creditTransaction.id, creditKey.txnId))
    .where(and(subtreeSql(top), lt(creditTransaction.delta, 0)))
    .groupBy(keyLineage.path);
  return pooledHeadroom(chain, rows.map((r) => ({ path: r.path, spent: Number(r.spent) })));
}

/**
 * Cascade-revoke a key's subtree: compute the api-key ids in `keyId`'s subtree (a keyed caller may revoke ONLY a STRICT
 * descendant of itself — not itself, an ancestor, or another branch) and soft-disable them via the injected `disableKeys`
 * (the app's apikey update — so @suluk/keys stays free of the Better Auth apikey table). MCP ids are skipped (a
 * connection is revoked elsewhere). Returns the count disabled.
 */
export async function revokeKeyTree(
  db: KeysDB,
  opts: { userId: string; keyId: string; callerKeyId?: string },
  disableKeys: (userId: string, keyIds: string[]) => Promise<number>,
): Promise<{ revoked: number }> {
  if (opts.callerKeyId != null) {
    const callerRow = await db.select({ path: keyLineage.path }).from(keyLineage).where(eq(keyLineage.keyId, opts.callerKeyId)).limit(1);
    const callerPath = callerRow[0]?.path ?? opts.callerKeyId;
    const targetRow = await db.select({ path: keyLineage.path }).from(keyLineage).where(eq(keyLineage.keyId, opts.keyId)).limit(1);
    const targetPath = targetRow[0]?.path;
    // the target must be a STRICT descendant of the caller (its path extends the caller's by ≥1 segment)
    if (targetPath == null || !targetPath.startsWith(callerPath + "/")) return { revoked: 0 };
  }
  const ids = (await subtreeOf(db, opts.keyId)).filter((id) => !id.startsWith("mcp:")); // only api-keys are disable-able
  if (ids.length === 0) return { revoked: 0 };
  return { revoked: await disableKeys(opts.userId, ids) };
}
