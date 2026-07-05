import { sulukFmt } from "@suluk/effect";
import * as M from "../models/todo";

export { ListTodosQuery } from "../models/todo";

export const getTodo = sulukFmt(M.findTodo);
export const listTodos = sulukFmt(M.listTodos);
export const createTodo = sulukFmt(M.insertTodo);
export const updateTodo = sulukFmt(M.patchTodo);
export const countTodos = sulukFmt(M.countTodos);
export const deleteTodo = sulukFmt(M.dropTodo, M.confirmDeleted);
