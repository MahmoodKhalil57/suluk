/**
 * Todo MODELS (Suluk registry: `todo`) — the MODEL layer of the controller→service→model split. Each is built from ONE query
 * via `queryOne`/`queryMany` (from `../app`): the query is the SINGLE source — its PROJECTION derives the response `ok.schema`
 * at build time (no hand-written `TodoItemSchema`), and the same query runs per-request. Each carries the STATE-SOURCE facts on
 * its slice — the derived schema, its `cost` (DEFINED HERE, so it bubbles up the sulukFmt pipeline), its by-id `errors`, and its
 * BDD `step`. Every query is owner-scoped (`owned`); timestamps are epoch-ms integers, so a returned ROW is already the wire item.
 */
import { Effect } from "effect";
import { z } from "zod";
import { and, desc, eq, type SQL } from "drizzle-orm";
import { sulukFn, NotFoundError, type CostModel } from "@suluk/effect";
import { listQuerySchema, parseListQuery, compileFilter, compileSort, compileTextSearch } from "@suluk/drizzle";
import { Db, queryOne, queryMany, mutate } from "../app";
import { todo } from "../db/todo";

/** the caller-tunable list-query shape (page/perPage/sort/order/q/filter) — the SAME opts used both to declare the
 *  route's query schema (doc) and to parse a real request (`listTodos`, below), so the two can never drift. */
const LIST_OPTS = { defaultPerPage: 20, maxPerPage: 100 };
/** the route-facing schema for `GET /api/todos`'s query params — re-exported (via the service) for the route to
 *  declare, without the ROUTE ever importing `@suluk/drizzle`/the table directly (routes→services→models). */
export const ListTodosQuery = listQuerySchema(todo, LIST_OPTS);

/** A todo row AS RETURNED — inferred from the master; timestamps are epoch-ms `number`s, so the row IS the wire item. */
export type TodoRow = z.infer<typeof todo.zodSchema>;
export type TodoItem = TodoRow;
/** the entity schema — the master itself; used by the composite `getTodoDetail` route (the CRUD models DERIVE theirs). */
export const TodoItemSchema = todo.zodSchema;
/** request bodies — SLICED off the master so a column's `.trim().min(1).max(500).regex(…)` validates on the wire. */
export const CreateReq = todo.zodSchema.pick({ title: true });
export const UpdateReq = todo.zodSchema.pick({ title: true, completed: true }).partial();

/** the owner-scoping predicate every by-id query reuses — a caller can only ever touch a row where BOTH id AND owner match. */
const owned = (userId: string, id: string) => and(eq(todo.id, id), eq(todo.userId, userId));

// The per-operation COSTS — DEFINED on the models; `sulukFmt` SUMS them up the tree so services/routes declare none.
const readCost: CostModel = { components: [], infra: { "d1.read": 1 }, settlement: { method: "rate-limited" } };
const writeCost: CostModel = { components: [], infra: { "d1.write": 1, "d1.read": 1 }, settlement: { method: "rate-limited", overflow: "credit" } };
const deleteCost: CostModel = { components: [], infra: { "d1.write": 1 }, settlement: { method: "rate-limited", overflow: "credit" } };

/** one todo the caller OWNS by id → `TodoItem`; a non-owned/absent id → typed 404. `ok.schema` DERIVES from the select, the
 *  404 DERIVES from `orElse` — neither is restated. */
export const findTodo = queryOne({
  cost: readCost, step: { role: "given", text: "a todo the caller owns exists" },
  store: { key: "todo", params: ["id"] }, // BACKS the by-id `$todo` reactive store family (one per :id)
  query: (db, ctx, id: string) => db.select().from(todo).where(owned(ctx.userId, id)).limit(1),
  orElse: (_ctx, id) => new NotFoundError({ resource: "todo", id }),
});

/** the caller's own todos → `TodoItem[]`, paginated/sorted/filtered/searched — the route's `listView` arrays the
 *  derived item schema. Takes the RAW query record (the controller just forwards `ctx.c.req.query()`, no
 *  drizzle/table dependency at that layer); `parseListQuery` + `compileFilter`/`compileSort`/`compileTextSearch`
 *  (all `@suluk/drizzle`, C114) turn it into real, bound SQL. The owner scope (`eq(todo.userId, ctx.userId)`) is
 *  ALWAYS the outermost AND term — a caller-supplied filter can never widen past it (AND of a contradictory
 *  `userId` sub-condition returns EMPTY, never another caller's rows) — never OR'd, never bypassed. ANY failure
 *  turning the request into SQL — malformed advanced `filter=` JSON, OR a syntactically-valid-but-semantically-
 *  invalid one (an op the target column's dataType doesn't support, e.g. `contains` on a boolean column —
 *  `compileFilter` deliberately THROWS for that, C114) — is caught HERE (not just around `parseListQuery`) and
 *  treated as "no filter, default sort, default page" (the same honest-default the SIMPLE mode already applies
 *  to an unrecognized field/op) rather than surfacing as an uncaught 500. Default sort (no `sort` param): newest
 *  first, matching the pre-C114 behavior exactly. */
export const listTodos = queryMany({
  cost: readCost,
  store: { key: "todos" }, // BACKS the `$todos` collection store
  query: (db, ctx, raw: Record<string, string>) => {
    const owner = eq(todo.userId, ctx.userId);
    let where = owner;
    let orderCols = [desc(todo.createdAt)];
    let limit = LIST_OPTS.defaultPerPage;
    let offset = 0;
    try {
      const lq = parseListQuery(raw, todo, LIST_OPTS);
      const filterCond = lq.filter ? compileFilter(todo, lq.filter) : undefined;
      const searchCond = compileTextSearch(todo, lq.q);
      where = and(owner, ...([filterCond, searchCond].filter((c): c is SQL => c !== undefined))) ?? owner;
      if (lq.sort.length) orderCols = compileSort(todo, lq.sort);
      limit = lq.limit;
      offset = lq.offset;
    } catch {
      // parseListQuery/compileFilter/compileTextSearch/compileSort failed for ANY reason -> ignore the whole
      // query and fall back to the safe default above (owner-scoped, unfiltered, newest-first). Never a 500.
    }
    return db.select().from(todo).where(where).orderBy(...orderCols).limit(limit).offset(offset);
  },
});

/** create a todo owned by the caller → `TodoItem`. `input` is SLICED off the master (`CreateReq`) — it TYPES `body` AND becomes
 *  the request body (validated + bubbled up), so the create route restates nothing. The `id` is generated by `$defaultFn(nanoid)`. */
export const insertTodo = queryOne({
  cost: writeCost,
  store: { invalidates: ["todos"] }, // a new todo only staleness the collection (no existing by-id view changes)
  input: CreateReq, // = todo.zodSchema.pick({ title: true }) — body is inferred as { title: string }
  query: (db, ctx, body) => {
    const now = Date.now();
    return db.insert(todo).values({ userId: ctx.userId, title: body.title, completed: false, createdAt: now, updatedAt: now }).returning();
  },
});

/** patch a todo the caller OWNS → `TodoItem`; absent/non-owned → 404 (from `orElse`). Takes `{ id, patch }`. */
export const patchTodo = queryOne({
  cost: writeCost, step: { role: "given", text: "a todo the caller owns exists" },
  store: { invalidates: ["todos", "todo"] }, // staleness both the collection AND the by-id view of the edited row
  query: (db, ctx, { id, patch }: { id: string; patch: { title?: string; completed?: boolean } }) =>
    db.update(todo).set({ ...patch, updatedAt: Date.now() }).where(owned(ctx.userId, id)).returning(),
  orElse: (_ctx, { id }) => new NotFoundError({ resource: "todo", id }),
});

/** delete a todo the caller OWNS → void; absent/non-owned → 404 (from `orElse`, which is the SINGLE place the error is
 *  defined + the source the doc reads). The route's service maps the void to `{ deleted: true }`. */
export const dropTodo = mutate({
  cost: deleteCost, step: { role: "given", text: "a todo the caller owns exists" },
  store: { invalidates: ["todos", "todo"] }, // staleness both the collection AND the by-id view of the deleted row
  query: (db, ctx, id: string) => db.delete(todo).where(owned(ctx.userId, id)).returning({ id: todo.id }),
  orElse: (_ctx, id) => new NotFoundError({ resource: "todo", id }),
});

/** the caller's total todo count → `number` (an aggregate, not a row projection) — fans in with `findTodo` in `getTodoDetail`. */
export const countTodos = sulukFn({
  cost: readCost, ok: { schema: z.number().int().describe("How many todos the caller has.") },
  run: (ctx): Effect.Effect<number, never, Db> => Effect.flatMap(Db, (db) => Effect.promise(async () =>
    (await db.select({ id: todo.id }).from(todo).where(eq(todo.userId, ctx.userId))).length)),
});

/** confirm a delete — maps `dropTodo`'s `void` to the `{ deleted: true }` wire body + declares that response schema. A
 *  MODEL (not a service leaf): it needs `z`/`Effect` directly, which the service layer never imports (routes→services→
 *  models import boundaries) — the service just `sulukFmt`s this alongside `dropTodo`, restating nothing. */
export const confirmDeleted = sulukFn({
  ok: { schema: z.object({ deleted: z.literal(true) }).describe("The todo was deleted.") },
  run: () => Effect.succeed({ deleted: true as const }),
});
