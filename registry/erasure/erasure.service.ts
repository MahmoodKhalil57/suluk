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

/** A factory that, given the request `db`, builds the per-module erase-steps — COMPOSED by the generator from each installed
 *  data module's `eraseStep` capability (platform.config.ts wires `erasure.cascade → <module>.eraseStep`, leaf-first). */
export type ExtraSteps = (db: DrizzleD1Database) => CascadeStep<ErasureUser>[];

/**
 * The default cascade is now EMPTY — the steps are DISTRIBUTED: each installed data module OWNS its own `eraseStep` (over
 * ITS table) and the generator composes only the installed ones into `extraSteps` (no central table list → a subset never
 * DELETEs a table it didn't install, and a GDPR build-guard warns if an installed module isn't wired). Kept for a manual/
 * community cascade an author writes by hand (`step`/`deleteStep`/`anonymizeStep` are re-exported above).
 */
export function sulukCascade(_db: DrizzleD1Database): CascadeStep<ErasureUser>[] {
  return [];
}

/**
 * The Better Auth `user.deleteUser.beforeDelete` hook — pass it to `buildAuth`'s `deleteUser.beforeDelete` so the cascade
 * fires whenever a user is deleted THROUGH auth. Thread the COMPOSED `extraSteps` (the same the admin route uses).
 */
export function erasureHook(db: DrizzleD1Database, opts?: CascadeOptions, extraSteps?: ExtraSteps): (user: ErasureUser) => Promise<void> {
  return beforeDeleteCascade(extraSteps?.(db) ?? sulukCascade(db), opts);
}

export class Erasure extends Context.Tag("Erasure")<
  Erasure,
  {
    /** run the erasure cascade for a user (fail-closed), then write the GDPR audit receipt. */
    readonly erase: (userId: string, opts?: CascadeOptions) => Effect.Effect<{ steps: string[] }>;
  }
>() {}

/** ErasureLive is a FACTORY — pass the COMPOSED `extraSteps` (the generator wires them from each installed data module's
 *  `eraseStep`). Omit → the empty cascade (a manual author supplies steps directly, or a subset erases nothing extra). */
export const ErasureLive = (extraSteps?: ExtraSteps) => Layer.effect(
  Erasure,
  Effect.gen(function* () {
    const db = yield* Db;
    return {
      erase: (userId, opts) =>
        Effect.promise(async () => {
          const steps = extraSteps?.(db) ?? sulukCascade(db);
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
