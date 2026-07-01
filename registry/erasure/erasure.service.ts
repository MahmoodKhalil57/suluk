/**
 * The Erasure service (Suluk registry: `erasure`) — GDPR account-erasure over `@suluk/better-auth`'s `beforeDeleteCascade`
 * (the FAIL-CLOSED orchestrator: if a cleanup step throws it ABORTS rather than half-erasing then deleting the user — that
 * discipline stays upstream, so a fix flows via npm). THIS layer is the owned wiring: an ordered cascade over the core
 * Suluk tables (all key on `userId`), the Better-Auth `deleteUser.beforeDelete` hook builder, and a GDPR audit receipt.
 * You PICK THE POSTURE (swap a `deleteStep` for an `anonymizeStep` to keep an FK-referenced row while scrubbing PII) and
 * the subsystems (trim `sulukCascade` to the modules you actually installed). Depends on `Db` (`app`).
 */
import { Context, Effect, Layer } from "effect";
import { sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { beforeDeleteCascade, deleteStep, anonymizeStep, step, type CascadeStep, type CascadeOptions } from "@suluk/better-auth";
import { erasureReceipt } from "../db/erasure";
import { Db } from "../app";

/** The minimal user shape the cascade needs (Better Auth passes the full user; we only read the id). */
export type ErasureUser = { id: string };

// re-export the step constructors so your app composes its own cascade without a second @suluk/better-auth import.
export { step, deleteStep, anonymizeStep, type CascadeStep, type CascadeOptions };

/**
 * The default hard-DELETE cascade over the core Suluk tables — EDIT to match the modules you installed + your posture.
 * Every core table keys on `userId`. Swap a `del(...)` for an `anonymizeStep` where an FK must survive. Ordered
 * leaf-first (logs/cost before the money rows) so a partial failure aborts before the load-bearing rows are touched.
 */
export function sulukCascade(db: DrizzleD1Database): CascadeStep<ErasureUser>[] {
  const del = (table: string) =>
    deleteStep<ErasureUser>(table, async (u) => {
      await db.run(sql`DELETE FROM ${sql.identifier(table)} WHERE ${sql.identifier("userId")} = ${u.id}`);
    });
  return [del("activity_log"), del("cost_event"), del("billing_account"), del("key_lineage"), del("credit_transaction")];
}

/**
 * The Better Auth `user.deleteUser.beforeDelete` hook — pass it to `buildAuth`'s `deleteUser.beforeDelete` so the cascade
 * fires whenever a user is deleted THROUGH auth (the proper integration). The service's `erase` is the manual/admin path.
 */
export function erasureHook(db: DrizzleD1Database, opts?: CascadeOptions): (user: ErasureUser) => Promise<void> {
  return beforeDeleteCascade(sulukCascade(db), opts);
}

export class Erasure extends Context.Tag("Erasure")<
  Erasure,
  {
    /** run the erasure cascade for a user (fail-closed), then write the GDPR audit receipt. */
    readonly erase: (userId: string, opts?: CascadeOptions) => Effect.Effect<{ steps: string[] }>;
  }
>() {}

export const ErasureLive = Layer.effect(
  Erasure,
  Effect.gen(function* () {
    const db = yield* Db;
    return {
      erase: (userId, opts) =>
        Effect.promise(async () => {
          const steps = sulukCascade(db);
          await beforeDeleteCascade(steps, opts)({ id: userId }); // throws (no receipt) if any step fails — fail-closed
          await db.insert(erasureReceipt).values({
            id: crypto.randomUUID(),
            userId,
            posture: "delete",
            steps: JSON.stringify(steps.map((s) => s.name)),
            erasedAt: new Date(),
          });
          return { steps: steps.map((s) => s.name) };
        }),
    };
  }),
);
