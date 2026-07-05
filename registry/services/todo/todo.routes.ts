import { Effect } from "effect";
import type { z } from "zod";
import { routeGroup, sulukFn, sulukFmt, sulukRoute, view, listView } from "@suluk/effect";
import { Db, DbLive, type Bindings } from "../app";
import * as S from "../services/todo";
import { ListTodosQuery } from "../services/todo";
import { CreateReq, UpdateReq } from "../models/todo";

const todos = routeGroup("/api/todos");

const provide = <X, E>(env: Bindings, p: Effect.Effect<X, E, Db>): Effect.Effect<X, E, never> =>
  p.pipe(Effect.provide(DbLive(env)));

const listTodos = sulukFmt(
  sulukFn({ method: "get", path: "/api/todos", name: "listTodos", roles: ["signed-in"],
    summary: "List the signed-in user's todos — paginated, sorted, and filtered (SIMPLE flat params or an ADVANCED and/or/not filter tree).",
    query: ListTodosQuery, view: listView("todos", { describe: "The caller's todos, newest first by default." }),
    step: { role: "when", text: "they list their todos" },
    run: (ctx) => Effect.succeed(ctx.c.req.query()) }),
  S.listTodos,
);

const getTodo = sulukFmt(
  sulukFn({ method: "get", path: "/api/todos/:id", name: "getTodo", roles: ["signed-in"],
    summary: "Get one of the signed-in user's todos by id.", view: view("todo"),
    step: [{ role: "when", text: "they open a todo by id" }, { role: "then", text: "the todo is returned" }],
    run: (ctx) => Effect.succeed(ctx.param("id")!) }),
  S.getTodo,
);

const createTodo = sulukFmt(
  sulukFn({ method: "post", path: "/api/todos", name: "createTodo", roles: ["signed-in"],
    summary: "Create a todo (owned by the signed-in user).", ok: { status: 201 }, view: view("todo"),
    step: { role: "when", text: "they create a todo" },
    run: (ctx, body: z.infer<typeof CreateReq>) => Effect.succeed(body) }),
  S.createTodo,
);

const updateTodo = sulukFmt(
  sulukFn({ method: "patch", path: "/api/todos/:id", name: "updateTodo", roles: ["signed-in"],
    summary: "Update a todo the signed-in user owns (title and/or completed).", body: UpdateReq, validateBody: true, view: view("todo"),
    step: { role: "when", text: "they edit a todo" },
    run: (ctx, patch) => Effect.succeed({ id: ctx.param("id")!, patch }) }),
  S.updateTodo,
);

const deleteTodo = sulukFmt(
  sulukFn({ method: "delete", path: "/api/todos/:id", name: "deleteTodo", roles: ["signed-in"],
    summary: "Delete a todo the signed-in user owns.",
    step: { role: "when", text: "they delete a todo" },
    run: (ctx) => Effect.succeed(ctx.param("id")!) }),
  S.deleteTodo,
);

const getTodoDetail = sulukFmt(
  sulukFn({ method: "get", path: "/api/todos/:id/detail", name: "getTodoDetail", roles: ["signed-in"],
    summary: "Get one todo the caller owns, alongside their total todo count.",
    step: { role: "when", text: "they open a todo with their total count" },
    run: (ctx) => Effect.succeed(ctx.param("id")!) }),
  sulukFmt.all({ todo: S.getTodo, count: S.countTodos }),
);

for (const r of [listTodos, getTodo, createTodo, updateTodo, deleteTodo, getTodoDetail]) todos.route(sulukRoute(r, { provide }));

export const todoOps = todos.ops;

export function todoRoutes() {
  return todos.router();
}
