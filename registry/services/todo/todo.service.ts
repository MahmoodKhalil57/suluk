/**
 * The Todo service (Suluk registry: `todo`) — a fully-owned Effect-TS CRUD service over the `todo` table. Depends on the
 * `Db` service from `app`. EVERY method takes the owner `userId` and filters on it, so ownership is enforced at the data
 * layer: there is no code path by which one user reads or mutates another user's todo (the route passes the AUTHENTICATED
 * principal, never a client id). Timestamps are stored as `Date` (drizzle `mode:"timestamp"`) and returned as epoch-ms.
 *
 * ALL schemas + types live in `../db/todo` (the single schema source) — this file imports them and the IMPLEMENTATION is
 * the only thing here. The `Todo` tag's shape is INFERRED from `make` (`ReturnType<typeof make>`), so there is no interface
 * to keep in sync, and the method PARAM types come straight off the drizzle-zod insert/update types.
 */
import { Context, Effect, Layer } from "effect";
import { and, desc, eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { NotFoundError } from "@suluk/effect";
import { todo, type TodoRow, type TodoInsert, type TodoUpdate, type TodoItem } from "../db/todo";
import { Db } from "../app";

/** Project a stored row (Date timestamps) to the wire DTO (epoch-ms). */
const toItem = (r: TodoRow): TodoItem => ({
  id: r.id,
  userId: r.userId,
  title: r.title,
  completed: r.completed,
  createdAt: r.createdAt.getTime(),
  updatedAt: r.updatedAt.getTime(),
});

/** the owner-scoping predicate reused by every by-id op — a caller can only ever touch a row where BOTH the id AND owner match. */
const owned = (userId: string, id: string) => and(eq(todo.id, id), eq(todo.userId, userId));

/**
 * The service IMPLEMENTATION — the methods, INLINE. Their Effect types (the success value AND the error channel) are INFERRED
 * from the bodies, so there is NO separate interface to keep in sync: the `Todo` tag's shape IS `ReturnType<typeof make>`.
 * `make(db)` binds the methods to the request's DB. Ownership is enforced in every by-id query (`owned`); `get`/`update`/
 * `remove` FAIL with `NotFoundError` when absent/non-owned — that error is INFERRED into the method's type and BUBBLES UP to a
 * typed 404. Param shapes come off the drizzle-zod types (`TodoInsert`/`TodoUpdate`) rather than a hand-written duplicate.
 */
const make = (db: DrizzleD1Database) => ({
  list: (userId: string) =>
    Effect.promise(async () => (await db.select().from(todo).where(eq(todo.userId, userId)).orderBy(desc(todo.createdAt))).map(toItem)),

  /** the caller's total todo count — a body-less read the `getTodoDetail` fan-out (`all`) composes alongside `get`. */
  count: (userId: string) =>
    Effect.promise(async () => (await db.select({ id: todo.id }).from(todo).where(eq(todo.userId, userId))).length),

  get: (userId: string, id: string) =>
    Effect.gen(function* () {
      const [row] = yield* Effect.promise(() => db.select().from(todo).where(owned(userId, id)).limit(1));
      if (!row) return yield* new NotFoundError({ resource: "todo", id }); // not found / not theirs → the 404 bubbles up
      return toItem(row);
    }),

  create: (userId: string, input: Pick<TodoInsert, "title">) =>
    Effect.promise(async () => {
      const now = new Date();
      const row: TodoRow = { id: crypto.randomUUID(), userId, title: input.title, completed: false, createdAt: now, updatedAt: now };
      await db.insert(todo).values(row);
      return toItem(row);
    }),

  update: (userId: string, id: string, patch: Pick<TodoUpdate, "title" | "completed">) =>
    Effect.gen(function* () {
      const rows = yield* Effect.promise(() => db.update(todo).set({ ...patch, updatedAt: new Date() }).where(owned(userId, id)).returning());
      if (!rows[0]) return yield* new NotFoundError({ resource: "todo", id }); // WHERE owner ⇒ absent/non-owned → 404
      return toItem(rows[0]);
    }),

  remove: (userId: string, id: string) =>
    Effect.gen(function* () {
      const rows = yield* Effect.promise(() => db.delete(todo).where(owned(userId, id)).returning({ id: todo.id }));
      if (rows.length === 0) return yield* new NotFoundError({ resource: "todo", id }); // WHERE owner ⇒ absent/non-owned → 404
    }),
});

/** The `Todo` service — its SHAPE is DERIVED from the implementation (`ReturnType<typeof make>`); no hand-written interface. */
export class Todo extends Context.Tag("Todo")<Todo, ReturnType<typeof make>>() {}

/** The layer — build the impl against the request's DB. */
export const TodoLive = Layer.effect(
  Todo,
  Effect.gen(function* () {
    const db = yield* Db;
    return make(db);
  }),
);
