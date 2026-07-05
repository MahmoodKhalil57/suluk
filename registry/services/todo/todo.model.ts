import { Effect } from "effect";
import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { sulukFn, NotFoundError, type CostModel } from "@suluk/effect";
import { listQuerySchema, resolveListQuery } from "@suluk/drizzle";
import { Db, queryOne, queryMany, mutate } from "../app";
import { todo } from "../db/todo";

const LIST_OPTS = { defaultPerPage: 20, maxPerPage: 100 };
export const ListTodosQuery = listQuerySchema(todo, LIST_OPTS);

export const IdParams = todo.zodSchema.pick({ id: true });
export const CreateReq = todo.zodSchema.pick({ title: true });
export const UpdateReq = todo.zodSchema.pick({ title: true, completed: true }).partial();

const owned = (userId: string, id: string) => and(eq(todo.id, id), eq(todo.userId, userId));

const readCost = { components: [], infra: { "d1.read": 1 }, settlement: { method: "rate-limited" } } satisfies CostModel;
const writeCost = { components: [], infra: { "d1.write": 1, "d1.read": 1 }, settlement: { method: "rate-limited", overflow: "credit" } } satisfies CostModel;
const deleteCost = { components: [], infra: { "d1.write": 1 }, settlement: { method: "rate-limited", overflow: "credit" } } satisfies CostModel;

export const findTodo = queryOne({
  cost: readCost, step: { role: "given", text: "a todo the caller owns exists" },
  store: { key: "todo", params: ["id"] },
  params: IdParams,
  query: (db, ctx, { id }) => db.select().from(todo).where(owned(ctx.userId, id)).limit(1),
  orElse: (_ctx, { id }) => new NotFoundError({ resource: "todo", id }),
});

export const listTodos = queryMany({
  cost: readCost,
  store: { key: "todos" },
  query: (db, ctx, raw: Record<string, string>) => {
    const { where, orderBy, limit, offset } = resolveListQuery(todo, raw, eq(todo.userId, ctx.userId), [desc(todo.createdAt)], LIST_OPTS);
    return db.select().from(todo).where(where).orderBy(...orderBy).limit(limit).offset(offset);
  },
});

export const insertTodo = queryOne({
  cost: writeCost,
  store: { invalidates: ["todos"] },
  input: CreateReq,
  query: (db, ctx, body) => {
    const now = Date.now();
    return db.insert(todo).values({ userId: ctx.userId, title: body.title, completed: false, createdAt: now, updatedAt: now }).returning();
  },
});

export const patchTodo = queryOne({
  cost: writeCost, step: { role: "given", text: "a todo the caller owns exists" },
  store: { invalidates: ["todos", "todo"] },
  params: IdParams,
  input: UpdateReq,
  query: (db, ctx, { id, ...patch }) => db.update(todo).set({ ...patch, updatedAt: Date.now() }).where(owned(ctx.userId, id)).returning(),
  orElse: (_ctx, { id }) => new NotFoundError({ resource: "todo", id }),
});

export const dropTodo = mutate({
  cost: deleteCost, step: { role: "given", text: "a todo the caller owns exists" },
  store: { invalidates: ["todos", "todo"] },
  params: IdParams,
  query: (db, ctx, { id }) => db.delete(todo).where(owned(ctx.userId, id)).returning({ id: todo.id }),
  orElse: (_ctx, { id }) => new NotFoundError({ resource: "todo", id }),
});

export const countTodos = sulukFn({
  cost: readCost, ok: { schema: z.number().int().describe("How many todos the caller has.") },
  run: (ctx): Effect.Effect<number, never, Db> => Effect.flatMap(Db, (db) => Effect.promise(async () =>
    (await db.select({ id: todo.id }).from(todo).where(eq(todo.userId, ctx.userId))).length)),
});

export const confirmDeleted = sulukFn({
  ok: { schema: z.object({ deleted: z.literal(true) }).describe("The todo was deleted.") },
  run: () => Effect.succeed({ deleted: true as const }),
});
