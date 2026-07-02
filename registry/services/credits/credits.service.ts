/**
 * The Credits service (Suluk registry: `credits`) — an Effect-TS service that wraps the `@suluk/credits` npm logic. The
 * MONEY-CRITICAL parts (the atomic `debitIfCovers` CAS that can't drive the ledger negative, the idempotent `grantOnce`)
 * stay in the package, so their fixes flow to you via npm; THIS layer is the owned, composable seam. Depends on the `Db`
 * service from `app`. Compose it into your runtime: `Layer.provide(CreditsLive, DbLive(env))`.
 */
import { Context, Effect, Layer } from "effect";
import { getBalance, debitIfCovers, grantOnce, listTransactions, type CreditsDB, type LedgerEntry } from "@suluk/credits";
import { Db } from "../app";

export class Credits extends Context.Tag("Credits")<
  Credits,
  {
    readonly balance: (userId: string) => Effect.Effect<number>;
    readonly debit: (userId: string, amount: number, reason: string) => Effect.Effect<boolean>;
    readonly grant: (userId: string, amount: number, idemKey: string, reason?: string) => Effect.Effect<boolean>;
    readonly transactions: (userId: string) => Effect.Effect<LedgerEntry[]>;
  }
>() {}

export const CreditsLive = Layer.effect(
  Credits,
  Effect.gen(function* () {
    const db = (yield* Db) as CreditsDB;
    return {
      balance: (userId) => Effect.promise(() => getBalance(db, userId)),
      debit: (userId, amount, reason) => Effect.promise(() => debitIfCovers(db, userId, amount, reason)),
      grant: (userId, amount, idemKey, reason) => Effect.promise(() => grantOnce(db, userId, amount, idemKey, reason ?? "grant")),
      transactions: (userId) => Effect.promise(() => listTransactions(db, userId)),
    };
  }),
);
