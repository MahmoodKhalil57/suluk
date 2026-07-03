/**
 * The Todo service (Suluk registry: `todo`) — a fully-owned Effect-TS CRUD service over the `todo` table. Depends on the
 * `Db` service from `app`. EVERY method takes the owner `userId` and filters on it, so ownership is enforced at the data
 * layer: there is no code path by which one user reads or mutates another user's todo (the route passes the AUTHENTICATED
 * principal, never a client id). Timestamps are stored as `Date` (drizzle `mode:"timestamp"`) and returned as epoch-ms.
 */
import { Context, Effect, Layer } from "effect";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { rowSchema, NotFoundError } from "@suluk/effect";
import { todo } from "../db/todo";
import { Db } from "../app";

/** The service's not-found failure — a caller asking for a todo that doesn't exist / isn't theirs. It BUBBLES UP: any route
 *  calling `get`/`update`/`remove` inherits it on its Effect error channel, and effectRoute renders it as a typed 404 with
 *  NO per-route declaration or null-check (add `errors: [NotFoundError]` only to DOCUMENT it). */
type TodoNotFound = InstanceType<typeof NotFoundError>;

/**
 * The wire DTO for a todo — the SINGLE SOURCE for its shape, its per-field DESCRIPTIONS + EXAMPLES. Derived from the `todo`
 * table (drizzle-zod's `rowSchema`, so a new column bubbles up here), with the timestamps projected to epoch-ms (the wire
 * codec). The ROUTES reference this schema, so the descriptions + `.meta({examples})` bubble up into the contract / Scalar
 * without being restated per route — the doc reads its labels + examples straight off the service's schema.
 */
export const TodoItemSchema = rowSchema(todo, {
  id: (s) => s.describe("The todo's unique id (uuid).").meta({ examples: ["a3a2747d-b05f-4db6-8ab5-50ea2c2a7b3f"] }),
  userId: (s) => s.describe("The owner's user id — the authenticated principal."),
  title: (s) => s.describe("The todo text.").meta({ examples: ["Buy milk"] }),
  completed: (s) => s.describe("Whether the todo is done.").meta({ examples: [false] }),
})
  .omit({ createdAt: true, updatedAt: true })
  .extend({
    createdAt: z.number().int().describe("When it was created — epoch milliseconds.").meta({ examples: [1783082151484] }),
    updatedAt: z.number().int().describe("When it was last updated — epoch milliseconds.").meta({ examples: [1783082151484] }),
  })
  // the ENTITY description — bubbles up as the response description of any route whose body wraps a single todo (`{ todo }`).
  .describe("The todo.");

/** A todo row as returned to the owner — z.infer of the wire DTO (timestamps as epoch-ms). */
export type TodoItem = z.infer<typeof TodoItemSchema>;

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
    /** one todo the caller OWNS — FAILS with NotFoundError when it doesn't exist / isn't theirs (the 404 bubbles up). */
    readonly get: (userId: string, id: string) => Effect.Effect<TodoItem, TodoNotFound>;
    /** create a todo owned by the caller. */
    readonly create: (userId: string, input: { title: string }) => Effect.Effect<TodoItem>;
    /** patch a todo the caller OWNS — FAILS with NotFoundError when it doesn't exist / isn't theirs. */
    readonly update: (userId: string, id: string, patch: { title?: string; completed?: boolean }) => Effect.Effect<TodoItem, TodoNotFound>;
    /** delete a todo the caller OWNS — FAILS with NotFoundError when it doesn't exist / isn't theirs. */
    readonly remove: (userId: string, id: string) => Effect.Effect<void, TodoNotFound>;
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
        Effect.gen(function* () {
          const [row] = yield* Effect.promise(() => db.select().from(todo).where(owned(userId, id)).limit(1));
          if (!row) return yield* new NotFoundError({ resource: "todo", id }); // not found / not theirs → the 404 bubbles up
          return toItem(row);
        }),

      create: (userId, input) =>
        Effect.promise(async () => {
          const now = new Date();
          const row: TodoRow = { id: crypto.randomUUID(), userId, title: input.title, completed: false, createdAt: now, updatedAt: now };
          await db.insert(todo).values(row);
          return toItem(row);
        }),

      update: (userId, id, patch) =>
        Effect.gen(function* () {
          const set: Partial<TodoRow> = { updatedAt: new Date() };
          if (patch.title !== undefined) set.title = patch.title;
          if (patch.completed !== undefined) set.completed = patch.completed;
          const rows = yield* Effect.promise(() => db.update(todo).set(set).where(owned(userId, id)).returning());
          if (!rows[0]) return yield* new NotFoundError({ resource: "todo", id }); // WHERE owner ⇒ absent/non-owned → 404
          return toItem(rows[0]);
        }),

      remove: (userId, id) =>
        Effect.gen(function* () {
          const rows = yield* Effect.promise(() => db.delete(todo).where(owned(userId, id)).returning({ id: todo.id }));
          if (rows.length === 0) return yield* new NotFoundError({ resource: "todo", id }); // WHERE owner ⇒ absent/non-owned → 404
        }),
    };
  }),
);
