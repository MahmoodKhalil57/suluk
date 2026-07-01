/**
 * The Admin service (Suluk registry: `admin`) — an Effect-TS service for admin-scoped operational/usage stats. The generic
 * ledger aggregate (credits granted vs spent, outstanding balance) stays in `@suluk/credits` (`ledgerStats`), so its fixes
 * flow to you via npm; THIS layer is the owned, composable seam that adds the module-owned ledger-row COUNT on top (the
 * user COUNT is the app's — it owns the `user` table — compose it here when you wire your auth schema in). Depends on the
 * `Db` service from `app`. Compose it into your runtime: `Layer.provide(AdminLive, DbLive(env))`.
 */
import { Context, Effect, Layer } from "effect";
import { count } from "drizzle-orm";
import { ledgerStats, creditTransaction, type CreditsDB, type LedgerStats } from "@suluk/credits";
import { Db } from "../app";

/** The admin dashboard aggregate: the generic ledger stats + the module-owned transaction count. `users` is the app's to
 *  add (it owns the user table) — left optional so the shape is stable whether or not you compose the count in. */
export interface AdminStats extends LedgerStats {
  transactions: number;
  users?: number;
}

export class Admin extends Context.Tag("Admin")<
  Admin,
  {
    /** aggregate ops/usage stats for the admin surface (ledger issued/spent/outstanding + transaction count). */
    readonly stats: () => Effect.Effect<AdminStats>;
  }
>() {}

export const AdminLive = Layer.effect(
  Admin,
  Effect.gen(function* () {
    const db = (yield* Db) as CreditsDB;
    return {
      stats: () =>
        Effect.promise(async () => {
          const ledger = await ledgerStats(db);
          const rows = await db.select({ n: count() }).from(creditTransaction);
          return { ...ledger, transactions: Number(rows[0]?.n ?? 0) };
        }),
    };
  }),
);
