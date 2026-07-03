/**
 * The Todo service (Suluk registry: `todo`) — a fully-owned Effect-TS CRUD service over the `todo` table. Depends on the
 * `Db` service from `app`. EVERY method takes the owner `userId` and filters on it, so ownership is enforced at the data
 * layer: there is no code path by which one user reads or mutates another user's todo (the route passes the AUTHENTICATED
 * principal, never a client id). Timestamps are stored as `Date` (drizzle `mode:"timestamp"`) and returned as epoch-ms.
 */
import { Context, Effect, Layer } from "effect";
import { and, desc, eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { z } from "zod";
import { rowSchema, NotFoundError } from "@suluk/effect";
import { todo } from "../db/todo";
import { Db } from "../app";

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

// ── request bodies (part of the wire contract, owned here) ──
const CreateReq = z.object({ title: z.string().min(1).max(500).describe("The todo text.").meta({ examples: ["Buy milk"] }) });
const UpdateReq = z.object({ title: z.string().min(1).max(500).optional(), completed: z.boolean().optional() });

/**
 * The per-operation WIRE CONTRACT — the `request` body, the `ok` response body, and the typed `errors` for each op, DEFINED
 * HERE (next to the data + the schemas they derive from), so a route BUBBLES ONE UP by spreading it (`...todoContract.read`)
 * instead of restating any schema. Change a field on `TodoItemSchema` once and every route's doc updates. `errors` lists what
 * the service BUBBLES UP (it renders at runtime regardless) so the contract DOCUMENTS the 404. This is the single,
 * maintainable source of the module's wire shape — schemas can't be inferred from a TS return type (types are erased), so
 * they live here as runtime VALUES and flow up through the routes.
 */
export const todoContract = {
  list: { ok: { schema: z.object({ todos: z.array(TodoItemSchema) }).describe("The caller's todos, newest first.") } },
  read: { ok: { schema: z.object({ todo: TodoItemSchema }) } },
  created: { request: { json: CreateReq }, ok: { schema: z.object({ todo: TodoItemSchema }) } },
  updated: { request: { json: UpdateReq }, ok: { schema: z.object({ todo: TodoItemSchema }) } },
  deleted: { ok: { status: 200, schema: z.object({ deleted: z.literal(true) }).describe("The todo was deleted.") } },
};

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

/** the owner-scoping predicate reused by every by-id op — a caller can only ever touch a row where BOTH the id AND owner match. */
const owned = (userId: string, id: string) => and(eq(todo.id, id), eq(todo.userId, userId));

/**
 * The service IMPLEMENTATION — the methods, INLINE. Their Effect types (the success value AND the error channel) are INFERRED
 * from the bodies, so there is NO separate interface to keep in sync: the `Todo` tag's shape IS `ReturnType<typeof make>`.
 * `make(db)` binds the methods to the request's DB. Ownership is enforced in every by-id query (`owned`); `get`/`update`/
 * `remove` FAIL with `NotFoundError` when absent/non-owned — that error is INFERRED into the method's type and BUBBLES UP to a
 * typed 404. Patch/insert shapes reuse `TodoRow` (the drizzle row type) rather than a hand-written duplicate.
 */
const make = (db: DrizzleD1Database) => ({
  list: (userId: string) =>
    Effect.promise(async () => (await db.select().from(todo).where(eq(todo.userId, userId)).orderBy(desc(todo.createdAt))).map(toItem)),

  get: (userId: string, id: string) =>
    Effect.gen(function* () {
      const [row] = yield* Effect.promise(() => db.select().from(todo).where(owned(userId, id)).limit(1));
      if (!row) return yield* new NotFoundError({ resource: "todo", id }); // not found / not theirs → the 404 bubbles up
      return toItem(row);
    }),

  create: (userId: string, input: Pick<TodoRow, "title">) =>
    Effect.promise(async () => {
      const now = new Date();
      const row: TodoRow = { id: crypto.randomUUID(), userId, title: input.title, completed: false, createdAt: now, updatedAt: now };
      await db.insert(todo).values(row);
      return toItem(row);
    }),

  update: (userId: string, id: string, patch: Partial<Pick<TodoRow, "title" | "completed">>) =>
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
