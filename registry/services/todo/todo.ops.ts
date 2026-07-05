/**
 * Todo SERVICES (Suluk registry: `todo`) — the SERVICE layer of the controller→service→model split: each a `sulukFn` built by
 * `sulukFmt`-ing the MODEL(s) it runs. This is where business logic would live (validation, orchestrating several models); for
 * plain CRUD a service is a thin pipeline over one model, and — crucially — it restates NOTHING: the cost, the by-id 404, and
 * the response schema all BUBBLE UP from the model's slice through `sulukFmt`. A ROUTE (`todo.routes.ts`) then `sulukFmt`s these
 * services with its HTTP identity + view. Import boundary: a service imports ONLY services + models — never a third-party
 * package directly (`effect`/`zod`/`drizzle-orm`); anything needing those lives in the model layer instead.
 */
import { sulukFmt } from "@suluk/effect";
import * as M from "../models/todo";

/** the `GET /api/todos` query schema (page/perPage/sort/order/q/filter, C114) — a plain re-export of the model's
 *  own value (computed there, where the table lives); the route imports it from HERE, never the model directly. */
export { ListTodosQuery } from "../models/todo";

/** one todo the caller owns → `TodoItem` (404 + read cost bubble from `findTodo`). */
export const getTodo = sulukFmt(M.findTodo);
/** the caller's todos, paginated/sorted/filtered/searched (read cost bubbles). */
export const listTodos = sulukFmt(M.listTodos);
/** create a todo → `TodoItem` (write cost bubbles). */
export const createTodo = sulukFmt(M.insertTodo);
/** patch a todo the caller owns → `TodoItem` (404 + write cost bubble). */
export const updateTodo = sulukFmt(M.patchTodo);
/** the caller's total count → `number` (composed-only; fans in at the route). */
export const countTodos = sulukFmt(M.countTodos);
/** delete a todo the caller owns → `{ deleted: true }` (404 + delete cost bubble from `dropTodo`; then confirm, a MODEL-layer leaf). */
export const deleteTodo = sulukFmt(M.dropTodo, M.confirmDeleted);
