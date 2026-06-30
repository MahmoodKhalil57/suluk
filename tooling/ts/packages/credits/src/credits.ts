/**
 * The credit ledger (C046) — the money-correctness core, extracted verbatim. The package owns the schema; the app injects
 * a Drizzle handle (`DrizzleD1Database` in prod; bun:sqlite bridged to it in tests — the query builders + raw SQL are
 * compatible). The two atomic primitives are the point: `debitIfCovers` (a single conditional INSERT that can never drive
 * the ledger negative under concurrency) and `debitOnceIfCovers` (INSERT OR IGNORE — the money-OUT double-spend guard for
 * partial refunds). The app-specific payment-alert kinds + the user-table count are NOT here (they stay in the app).
 */
import { and, desc, eq, lt, sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { rowsChanged } from "@suluk/drizzle";
import { creditTransaction, creditAmount, creditKey } from "./schema";

/** The injected DB handle. Prod is drizzle/d1; tests bridge drizzle/bun-sqlite to this type (a runtime-identity narrow). */
export type CreditsDB = DrizzleD1Database;

export class InsufficientCreditsError extends Error {
  constructor(
    public readonly balance: number,
    public readonly needed: number,
  ) {
    super(`Insufficient credits: have ${balance}, need ${needed}.`);
    this.name = "InsufficientCreditsError";
  }
}

/** Current balance = sum of all ledger deltas for the user. */
export async function getBalance(db: CreditsDB, userId: string): Promise<number> {
  const rows = await db
    .select({ bal: sql<number>`coalesce(sum(${creditTransaction.delta}), 0)` })
    .from(creditTransaction)
    .where(eq(creditTransaction.userId, userId));
  return Number(rows[0]?.bal ?? 0);
}

/** Append one ledger row (the single writer); returns the new row id. `delta` is + on grant/top-up, − on debit. */
export async function record(db: CreditsDB, userId: string, delta: number, reason: string): Promise<string> {
  const id = crypto.randomUUID();
  await db.insert(creditTransaction).values({ id, userId, delta, reason, createdAt: new Date() });
  return id;
}

/** Attribute a debit row to the API KEY that spent it (per-key usage + limit join). Best-effort + idempotent (PK on
 *  txnId) — attribution is reporting, NOT the money path, so a failure here must never break the debit it rode in on. */
export async function recordKey(db: CreditsDB, txnId: string, keyId: string | null | undefined): Promise<void> {
  if (!keyId) return;
  try {
    await db.insert(creditKey).values({ txnId, keyId }).onConflictDoNothing().run();
  } catch (e) {
    console.warn(`[credit-key] couldn't attribute ${txnId} to ${keyId}:`, e instanceof Error ? e.message : String(e));
  }
}

/**
 * ATOMIC metered debit — append `-amount` ONLY IF the balance still covers it, in ONE conditional INSERT (atomic on both
 * bun:sqlite and D1), then best-effort attribute it. Returns true when debited, false when the balance raced below the
 * cost. Closes the read-then-write window where K concurrent charges each read the same balance, all pass `cost <=
 * balance`, and all append — driving the ledger NEGATIVE. The self-guard rejects a non-positive/non-integer `amount`
 * (a negative would compute delta=+amount and trivially pass the WHERE, MINTING credits).
 */
export async function debitIfCovers(db: CreditsDB, userId: string, amount: number, reason: string, keyId?: string | null): Promise<boolean> {
  if (!Number.isInteger(amount) || amount <= 0) return false;
  const id = crypto.randomUUID();
  const createdAt = Math.floor(Date.now() / 1000); // integer({mode:"timestamp"}) stores epoch SECONDS
  const res = await db.run(
    sql`INSERT INTO credit_transaction (id, userId, delta, reason, createdAt)
        SELECT ${id}, ${userId}, ${-amount}, ${reason}, ${createdAt}
        WHERE (SELECT coalesce(sum(delta), 0) FROM credit_transaction WHERE userId = ${userId}) >= ${amount}`,
  );
  if (rowsChanged(res) === 0) return false; // the balance raced below the cost → no debit, no negative ledger
  await recordKey(db, id, keyId);
  return true;
}

/** Total credits a key has spent — SUM(abs(delta)) over its attributed DEBITS (delta < 0). Drives the per-key cap + the
 *  keys-page usage column. */
export async function keySpend(db: CreditsDB, keyId: string): Promise<number> {
  const rows = await db
    .select({ spent: sql<number>`coalesce(sum(-${creditTransaction.delta}), 0)` })
    .from(creditKey)
    .innerJoin(creditTransaction, eq(creditTransaction.id, creditKey.txnId))
    .where(and(eq(creditKey.keyId, keyId), lt(creditTransaction.delta, 0)));
  return Number(rows[0]?.spent ?? 0);
}

/** The outcome of an idempotent debit attempt (see {@link debitOnceIfCovers}). */
export type DebitOutcome = { outcome: "debited" | "replayed" | "insufficient"; nonce: string };

/** The DETERMINISTIC ledger row id an idempotent operation maps to — exported so a caller can pre-check existence at the
 *  SAME id {@link debitOnceIfCovers} will use, without re-deriving the format and risking drift. */
export function nonceFor(reason: string, idemKey: string): string {
  return `${reason}:${idemKey}`;
}

/**
 * Idempotent atomic debit: debit `amount` ONLY if the balance covers it AND this exact logical operation (identified by
 * `idemKey`) hasn't already been debited. The row id is DERIVED from the key (`${reason}:${idemKey}`), so a retry/duplicate
 * collides on the primary key and is IGNORED — it can never mint a second debit. The money-OUT double-spend guard a
 * per-call random nonce lacks for PARTIAL refunds. One statement (INSERT OR IGNORE … WHERE SUM(delta) >= amount), atomic
 * on both engines. Returns `debited` (fresh — `nonce` anchors the downstream Stripe idempotency key), `replayed` (already
 * debited — caller MUST NOT move money again), or `insufficient` (balance no longer covers it).
 */
export async function debitOnceIfCovers(db: CreditsDB, userId: string, amount: number, reason: string, idemKey: string): Promise<DebitOutcome> {
  const nonce = nonceFor(reason, idemKey);
  if (!Number.isInteger(amount) || amount <= 0) return { outcome: "insufficient", nonce };
  const createdAt = Math.floor(Date.now() / 1000);
  const res = await db.run(
    sql`INSERT OR IGNORE INTO credit_transaction (id, userId, delta, reason, createdAt)
        SELECT ${nonce}, ${userId}, ${-amount}, ${reason}, ${createdAt}
        WHERE (SELECT coalesce(sum(delta), 0) FROM credit_transaction WHERE userId = ${userId}) >= ${amount}`,
  );
  if (rowsChanged(res) > 0) return { outcome: "debited", nonce };
  // No row inserted: EITHER the id existed (duplicate/retry → replay) OR the balance didn't cover it. Disambiguate by existence.
  const existing = await db.select({ id: creditTransaction.id }).from(creditTransaction).where(eq(creditTransaction.id, nonce)).limit(1);
  return { outcome: existing.length > 0 ? "replayed" : "insufficient", nonce };
}

/**
 * Idempotent debit + per-key ATTRIBUTION — the money primitive a per-item bulk charge needs ({@link debitOnceIfCovers}
 * itself does NOT attribute). On a FRESH `debited` it records the spend against `keyId` (the row id is the stable nonce);
 * a `replayed`/`insufficient` attributes nothing.
 */
export async function debitOnceAttributed(db: CreditsDB, userId: string, amount: number, reason: string, idemKey: string, keyId?: string | null): Promise<DebitOutcome> {
  const outcome = await debitOnceIfCovers(db, userId, amount, reason, idemKey);
  if (outcome.outcome === "debited") await recordKey(db, outcome.nonce, keyId);
  return outcome;
}

/** The signed credit `delta` + recorded `amountCents` for ONE ledger row id, or null if absent. Lets an idempotent replay
 *  report the ORIGINAL operation's amounts — never the retry's (possibly tampered) request. */
export async function ledgerRow(db: CreditsDB, id: string): Promise<{ delta: number; amountCents: number | null } | null> {
  const rows = await db
    .select({ delta: creditTransaction.delta, amountCents: creditAmount.amountCents })
    .from(creditTransaction)
    .leftJoin(creditAmount, eq(creditAmount.txnId, creditTransaction.id))
    .where(eq(creditTransaction.id, id))
    .limit(1);
  const r = rows[0];
  return r ? { delta: r.delta, amountCents: r.amountCents ?? null } : null;
}

/** One ledger row as a panel shows it (`createdAt` epoch-ms). `amountCents` is the SIGNED cash that moved (+ in, − out),
 *  or null for credits-only rows (usage debits, free grants). */
export interface LedgerEntry {
  id: string;
  delta: number;
  reason: string;
  createdAt: number;
  amountCents: number | null;
}

/** Annotate a ledger row with the CASH that moved (signed). Idempotent (PK on txnId), best-effort (purely cosmetic). No-op on 0/null. */
export async function recordAmount(db: CreditsDB, txnId: string, amountCents: number | null | undefined): Promise<void> {
  if (!amountCents) return;
  try {
    await db.insert(creditAmount).values({ txnId, amountCents }).onConflictDoNothing().run();
  } catch (e) {
    console.warn(`[credit-amount] couldn't record ${amountCents}¢ for ${txnId}:`, e instanceof Error ? e.message : String(e));
  }
}

/** The user's recent ledger rows (grants + debits) with the cash that moved, newest first — the "recent transactions" +
 *  the activity log. `limit` is generous (effectively "all" for a normal account). */
export async function listTransactions(db: CreditsDB, userId: string, limit = 250): Promise<LedgerEntry[]> {
  const rows = await db
    .select({ id: creditTransaction.id, delta: creditTransaction.delta, reason: creditTransaction.reason, createdAt: creditTransaction.createdAt, amountCents: creditAmount.amountCents })
    .from(creditTransaction)
    .leftJoin(creditAmount, eq(creditAmount.txnId, creditTransaction.id))
    .where(eq(creditTransaction.userId, userId))
    .orderBy(desc(creditTransaction.createdAt))
    .limit(limit);
  return rows.map((r) => ({ id: r.id, delta: r.delta, reason: r.reason, createdAt: r.createdAt.getTime(), amountCents: r.amountCents ?? null }));
}

export interface LedgerStats {
  creditsIssued: number;
  creditsSpent: number;
  balanceOutstanding: number;
}

/** Aggregate ledger stats (granted vs spent, outstanding) — the generic part of an admin dashboard. The user COUNT is the
 *  app's (it owns the user table); compose it on top. */
export async function ledgerStats(db: CreditsDB): Promise<LedgerStats> {
  const ledger = await db
    .select({
      issued: sql<number>`coalesce(sum(case when ${creditTransaction.delta} > 0 then ${creditTransaction.delta} else 0 end), 0)`,
      spent: sql<number>`coalesce(sum(case when ${creditTransaction.delta} < 0 then -${creditTransaction.delta} else 0 end), 0)`,
      balance: sql<number>`coalesce(sum(${creditTransaction.delta}), 0)`,
    })
    .from(creditTransaction);
  return { creditsIssued: Number(ledger[0]?.issued ?? 0), creditsSpent: Number(ledger[0]?.spent ?? 0), balanceOutstanding: Number(ledger[0]?.balance ?? 0) };
}

/** Grant/top-up credits. Returns the new balance. */
export async function addCredits(db: CreditsDB, userId: string, amount: number, reason: string): Promise<number> {
  if (!Number.isInteger(amount) || amount <= 0) throw new Error("amount must be a positive integer");
  await record(db, userId, amount, reason);
  return getBalance(db, userId);
}

/**
 * Debit credits if the balance covers it; throws InsufficientCreditsError otherwise. Returns the new balance.
 * NOTE: read-then-write — fine at low concurrency; use {@link debitIfCovers} for the concurrency-safe atomic path.
 */
export async function debitCredits(db: CreditsDB, userId: string, amount: number, reason: string): Promise<number> {
  if (!Number.isInteger(amount) || amount <= 0) throw new Error("amount must be a positive integer");
  const balance = await getBalance(db, userId);
  if (balance < amount) throw new InsufficientCreditsError(balance, amount);
  await record(db, userId, -amount, reason);
  return balance - amount;
}
