import { test, expect, describe, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import {
  getBalance, addCredits, debitIfCovers, debitCredits, debitOnceIfCovers, debitOnceAttributed,
  recordKey, keySpend, listTransactions, ledgerStats, nonceFor, InsufficientCreditsError, type CreditsDB,
} from "../src/index";

/**
 * C046 — the credit ledger, witnessed against a REAL bun:sqlite (the whole point is the atomic SQL). The package owns the
 * schema; we apply it here and bridge bun:sqlite → CreditsDB (a runtime-identity narrow, as the source app does in tests).
 */
function freshDb(): CreditsDB {
  const sqlite = new Database(":memory:");
  sqlite.run(`CREATE TABLE credit_transaction (id TEXT PRIMARY KEY, userId TEXT NOT NULL, delta INTEGER NOT NULL, reason TEXT NOT NULL, createdAt INTEGER NOT NULL)`);
  sqlite.run(`CREATE TABLE credit_amount (txnId TEXT PRIMARY KEY REFERENCES credit_transaction(id), amountCents INTEGER NOT NULL)`);
  sqlite.run(`CREATE TABLE credit_key (txnId TEXT PRIMARY KEY REFERENCES credit_transaction(id), keyId TEXT NOT NULL)`);
  return drizzle(sqlite) as unknown as CreditsDB;
}

let db: CreditsDB;
const U = "user_1";
beforeEach(() => {
  db = freshDb();
});

describe("ledger basics", () => {
  test("addCredits → balance is the sum of deltas", async () => {
    expect(await getBalance(db, U)).toBe(0);
    expect(await addCredits(db, U, 100, "topup")).toBe(100);
    expect(await addCredits(db, U, 50, "topup")).toBe(150);
    expect(await getBalance(db, U)).toBe(150);
  });

  test("addCredits rejects a non-positive / non-integer amount", async () => {
    await expect(addCredits(db, U, 0, "x")).rejects.toThrow();
    await expect(addCredits(db, U, 1.5, "x")).rejects.toThrow();
  });
});

describe("debitIfCovers — the atomic floor (never negative)", () => {
  test("debits when covered; rejects when it would go below zero; balance never negative", async () => {
    await addCredits(db, U, 100, "topup");
    expect(await debitIfCovers(db, U, 30, "transcribe")).toBe(true);
    expect(await getBalance(db, U)).toBe(70);
    expect(await debitIfCovers(db, U, 100, "transcribe")).toBe(false); // 100 > 70 → no debit
    expect(await getBalance(db, U)).toBe(70); // unchanged — the conditional INSERT didn't fire
  });

  test("self-guard: a negative amount can't MINT credits", async () => {
    await addCredits(db, U, 10, "topup");
    expect(await debitIfCovers(db, U, -50, "evil")).toBe(false);
    expect(await getBalance(db, U)).toBe(10);
  });

  test("attributes the debit to a key (keySpend)", async () => {
    await addCredits(db, U, 100, "topup");
    await debitIfCovers(db, U, 40, "transcribe", "key_abc");
    expect(await keySpend(db, "key_abc")).toBe(40);
    expect(await keySpend(db, "key_other")).toBe(0);
  });
});

describe("debitCredits — read-then-write, throws when short", () => {
  test("throws InsufficientCreditsError with balance + needed", async () => {
    await addCredits(db, U, 20, "topup");
    expect(await debitCredits(db, U, 15, "use")).toBe(5);
    await expect(debitCredits(db, U, 99, "use")).rejects.toBeInstanceOf(InsufficientCreditsError);
  });
});

describe("debitOnceIfCovers — idempotent double-spend guard", () => {
  test("a fresh debit, then a replay of the SAME idemKey does NOT debit again", async () => {
    await addCredits(db, U, 100, "topup");
    const first = await debitOnceIfCovers(db, U, 30, "refund", "stripe_re_1");
    expect(first.outcome).toBe("debited");
    expect(first.nonce).toBe(nonceFor("refund", "stripe_re_1"));
    expect(await getBalance(db, U)).toBe(70);

    const replay = await debitOnceIfCovers(db, U, 30, "refund", "stripe_re_1"); // retry
    expect(replay.outcome).toBe("replayed");
    expect(await getBalance(db, U)).toBe(70); // NOT 40 — no second debit
  });

  test("insufficient when the balance no longer covers a NEW idemKey", async () => {
    await addCredits(db, U, 10, "topup");
    const r = await debitOnceIfCovers(db, U, 50, "refund", "stripe_re_2");
    expect(r.outcome).toBe("insufficient");
    expect(await getBalance(db, U)).toBe(10);
  });

  test("debitOnceAttributed attributes only the fresh debit", async () => {
    await addCredits(db, U, 100, "topup");
    await debitOnceAttributed(db, U, 25, "bulk", "item_1", "key_x");
    await debitOnceAttributed(db, U, 25, "bulk", "item_1", "key_x"); // replay → no new spend
    expect(await keySpend(db, "key_x")).toBe(25);
  });
});

describe("listTransactions + ledgerStats", () => {
  test("recent transactions newest-first; aggregate stats", async () => {
    await addCredits(db, U, 100, "topup");
    await debitIfCovers(db, U, 30, "transcribe");
    const txns = await listTransactions(db, U);
    expect(txns.length).toBe(2);
    expect(txns.map((t) => t.delta).sort((a, b) => a - b)).toEqual([-30, 100]);
    expect(await ledgerStats(db)).toEqual({ creditsIssued: 100, creditsSpent: 30, balanceOutstanding: 70 });
  });
});
