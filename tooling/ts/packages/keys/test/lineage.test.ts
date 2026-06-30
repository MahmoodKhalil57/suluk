import { test, expect, describe, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { insertLineage, subtreeOf, parentPathOf, chainHeadroom, revokeKeyTree, type KeysDB, type ChainNode } from "../src/index";
import { addCredits, debitIfCovers, type CreditsDB } from "@suluk/credits";

/**
 * C046 — the keys lineage DB ops, witnessed against a REAL bun:sqlite. chainHeadroom is the INTEGRATION point where
 * @suluk/keys meets @suluk/credits: the pooled headroom is computed by joining the credit ledger, proving the abuse-proof
 * cap is real across a whole subtree (a parent cap bounds parent + children TOTAL spend, not just the parent's own).
 */
function freshDb(): KeysDB & CreditsDB {
  const sqlite = new Database(":memory:");
  sqlite.run(`CREATE TABLE key_lineage (keyId TEXT PRIMARY KEY, parentKeyId TEXT, userId TEXT NOT NULL, path TEXT NOT NULL, depth INTEGER NOT NULL)`);
  sqlite.run(`CREATE TABLE credit_transaction (id TEXT PRIMARY KEY, userId TEXT NOT NULL, delta INTEGER NOT NULL, reason TEXT NOT NULL, createdAt INTEGER NOT NULL)`);
  sqlite.run(`CREATE TABLE credit_amount (txnId TEXT PRIMARY KEY REFERENCES credit_transaction(id), amountCents INTEGER NOT NULL)`);
  sqlite.run(`CREATE TABLE credit_key (txnId TEXT PRIMARY KEY REFERENCES credit_transaction(id), keyId TEXT NOT NULL)`);
  return drizzle(sqlite) as unknown as KeysDB & CreditsDB;
}

const node = (over: Partial<ChainNode> & { keyId: string; path: string }): ChainNode => ({ scopes: [], ownCreditLimit: null, ownRateSharePct: null, ownExpiresAt: null, ...over });
let db: KeysDB & CreditsDB;
const U = "user_1";
beforeEach(() => {
  db = freshDb();
});

describe("lineage tree", () => {
  test("insertLineage builds materialized paths; subtreeOf + parentPathOf walk them", async () => {
    await insertLineage(db, { keyId: "root", parentKeyId: null, userId: U, parentPath: null });
    await insertLineage(db, { keyId: "child", parentKeyId: "root", userId: U, parentPath: "root" });
    await insertLineage(db, { keyId: "grand", parentKeyId: "child", userId: U, parentPath: "root/child" });

    expect((await subtreeOf(db, "root")).sort()).toEqual(["child", "grand", "root"]);
    expect((await subtreeOf(db, "child")).sort()).toEqual(["child", "grand"]);
    expect(await parentPathOf(db, "child")).toBe("root/child");
    expect(await parentPathOf(db, null)).toBeNull();
    expect(await subtreeOf(db, "unknown")).toEqual(["unknown"]); // legacy/childless fallback
  });
});

describe("chainHeadroom — keys × credits, the pooled cap is real", () => {
  test("a parent cap bounds parent + child TOTAL spend (pooled across the subtree)", async () => {
    await insertLineage(db, { keyId: "root", parentKeyId: null, userId: U, parentPath: null });
    await insertLineage(db, { keyId: "child", parentKeyId: "root", userId: U, parentPath: "root" });
    await addCredits(db, U, 1000, "topup");
    await debitIfCovers(db, U, 30, "use", "root"); // attributed to key "root"
    await debitIfCovers(db, U, 10, "use", "child"); // attributed to key "child"

    const chain = [node({ keyId: "root", path: "root", ownCreditLimit: 50 }), node({ keyId: "child", path: "root/child" })];
    // pooled: root's subtree spend = 30 (own) + 10 (child) = 40 → remaining 10 (NOT 20, which un-pooled would give)
    expect(await chainHeadroom(db, chain)).toEqual({ limit: 50, spent: 40, remaining: 10 });
  });

  test("no cap in the chain → null (only the account balance gates)", async () => {
    await insertLineage(db, { keyId: "root", parentKeyId: null, userId: U, parentPath: null });
    expect(await chainHeadroom(db, [node({ keyId: "root", path: "root" })])).toBeNull();
  });
});

describe("revokeKeyTree — cascade with the strict-descendant guard", () => {
  test("disables the subtree via the injected disableKeys; a keyed caller may revoke only a STRICT descendant", async () => {
    await insertLineage(db, { keyId: "root", parentKeyId: null, userId: U, parentPath: null });
    await insertLineage(db, { keyId: "child", parentKeyId: "root", userId: U, parentPath: "root" });
    let disabled: string[] = [];
    const disableKeys = async (_userId: string, ids: string[]) => {
      disabled = ids;
      return ids.length;
    };

    // a session (no callerKeyId) revokes child + its subtree
    expect(await revokeKeyTree(db, { userId: U, keyId: "child" }, disableKeys)).toEqual({ revoked: 1 });
    expect(disabled).toEqual(["child"]);

    // a keyed caller "root" may revoke its STRICT descendant "child"
    disabled = [];
    expect(await revokeKeyTree(db, { userId: U, keyId: "child", callerKeyId: "root" }, disableKeys)).toEqual({ revoked: 1 });

    // a keyed caller may NOT revoke itself (not a strict descendant)
    disabled = [];
    expect(await revokeKeyTree(db, { userId: U, keyId: "child", callerKeyId: "child" }, disableKeys)).toEqual({ revoked: 0 });
    expect(disabled).toEqual([]);
  });
});
