/**
 * The Todo service (Suluk registry: `todo`) — a fully-owned Effect-TS CRUD service over the `todo` table. Depends on the
 * `Db` service from `app`. EVERY method takes the owner `userId` and filters on it, so ownership is enforced at the data
 * layer: there is no code path by which one user reads or mutates another user's todo (the route passes the AUTHENTICATED
 * principal, never a client id). Timestamps are stored as `Date` (drizzle `mode:"timestamp"`) and returned as epoch-ms.
 */
import { Context, Effect, Layer } from "effect";
import { and, desc, eq } from "drizzle-orm";
import { todo } from "../db/todo";
import { Db } from "../app";

/** A todo row as returned to the owner — the DB row with timestamps projected to epoch-ms (the wire shape). */
export interface TodoItem {
  id: string;
  userId: string;
  title: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
}

/** The stored row shape (drizzle returns `Date` for the timestamp columns). */
type TodoRow = typeof todo.$inferSelect;
const toItem = (r: TodoRow): TodoItem => ({
  id: r.id,
  userId: r.userId,
  title: r.title,
  completed: r.completed,
  createdAt: r.createdAt.getTime(),
  updatedAt: r.updatedAt.getTime(),
});

export class Todo extends Context.Tag("Todo")<
  Todo,
  {
    /** the caller's todos, newest first. */
    readonly list: (userId: string) => Effect.Effect<TodoItem[]>;
    /** one todo the caller OWNS, or null (not found / not theirs — indistinguishable, by design). */
    readonly get: (userId: string, id: string) => Effect.Effect<TodoItem | null>;
    /** create a todo owned by the caller. */
    readonly create: (userId: string, input: { title: string }) => Effect.Effect<TodoItem>;
    /** patch a todo the caller OWNS (title and/or completed); null when it doesn't exist / isn't theirs. */
    readonly update: (userId: string, id: string, patch: { title?: string; completed?: boolean }) => Effect.Effect<TodoItem | null>;
    /** delete a todo the caller OWNS; false when it doesn't exist / isn't theirs. */
    readonly remove: (userId: string, id: string) => Effect.Effect<boolean>;
  }
>() {}

export const TodoLive = Layer.effect(
  Todo,
  Effect.gen(function* () {
    const db = yield* Db;
    /** the owner-scoping predicate reused by every by-id op — a caller can only ever touch a row where BOTH match. */
    const owned = (userId: string, id: string) => and(eq(todo.id, id), eq(todo.userId, userId));
    return {
      list: (userId) =>
        Effect.promise(async () => (await db.select().from(todo).where(eq(todo.userId, userId)).orderBy(desc(todo.createdAt))).map(toItem)),

      get: (userId, id) =>
        Effect.promise(async () => {
          const [row] = await db.select().from(todo).where(owned(userId, id)).limit(1);
          return row ? toItem(row) : null;
        }),

      create: (userId, input) =>
        Effect.promise(async () => {
          const now = new Date();
          const row: TodoRow = { id: crypto.randomUUID(), userId, title: input.title, completed: false, createdAt: now, updatedAt: now };
          await db.insert(todo).values(row);
          return toItem(row);
        }),

      update: (userId, id, patch) =>
        Effect.promise(async () => {
          const set: Partial<TodoRow> = { updatedAt: new Date() };
          if (patch.title !== undefined) set.title = patch.title;
          if (patch.completed !== undefined) set.completed = patch.completed;
          const rows = await db.update(todo).set(set).where(owned(userId, id)).returning();
          return rows[0] ? toItem(rows[0]) : null; // WHERE owner ⇒ a non-owned/absent id updates nothing → null
        }),

      remove: (userId, id) =>
        Effect.promise(async () => {
          const rows = await db.delete(todo).where(owned(userId, id)).returning({ id: todo.id });
          return rows.length > 0; // WHERE owner ⇒ a non-owned/absent id deletes nothing → false
        }),
    };
  }),
);
