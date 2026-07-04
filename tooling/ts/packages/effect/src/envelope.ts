/**
 * The two primitives a {@link sulukFn}'s `run` reads and returns — kept together because they're the wire boundary of the ONE
 * composable unit (see suluk-fn.ts):
 *   • {@link ActionCtx} — the per-request context a run reads (the injected principal, a path-param reader, the raw Hono ctx).
 *   • {@link Envelope} + {@link envelope}/{@link listEnvelope} — a response WRAP (`{ todo }` / `{ todos: [...] }`): the wire
 *     body's zod schema AND the map that produces it, built together so the documented shape and the rendered shape can't drift.
 *     A `view("todo")`/`listView("todos")` on a route is exactly a pending `envelope`/`listEnvelope` bound to the model's schema.
 *
 * (Historical note: this file was `action.ts` and once carried the C080 service-action + pipeline machinery. That whole layer
 * was superseded by `sulukFn`/`sulukFmt` (C091–C093) and removed in the C100 diet — only these two boundary primitives remain.)
 */
import { z } from "zod";
import type { Context } from "hono";

/** The per-request context a run reads. `userId` is the injected principal (guaranteed for a signed-in/admin route, as
 *  sulukRoute/effectRoute injects it — a public route gets `""`). `param` reads a path param; `c` is the raw Hono ctx. */
export interface ActionCtx {
  readonly c: Context;
  readonly userId: string;
  readonly param: (name: string) => string | undefined;
}

/**
 * A response ENVELOPE — where the `{ todo: TodoItem }` / `{ todos: [...] }` wrap lives. `schema` (the wire body's zod schema,
 * → `ok.schema`) and `value` (the map from the domain value to that body) are built TOGETHER by {@link envelope}/
 * {@link listEnvelope}, so the documented shape and the rendered shape cannot drift. `Dom` = the domain value; `Wire` = the body.
 */
export interface Envelope<Dom, Wire> {
  readonly schema: z.ZodType<Wire>;
  readonly value: (domain: Dom) => Wire;
}

/**
 * Build a `{ [key]: domain }` single-entity envelope — `schema = z.object({ key: domainSchema })` and `value = (d) => ({ key: d })`
 * from ONE call, so they can't drift. `describe` sets the wire body's description (else it bubbles from the entity's own
 * `.describe(...)` via effectRoute's single-key unwrap).
 */
export function envelope<K extends string, Dom>(
  key: K,
  domainSchema: z.ZodType<Dom>,
  opts?: { describe?: string },
): Envelope<Dom, { [P in K]: Dom }> {
  let schema = z.object({ [key]: domainSchema } as unknown as Record<K, z.ZodType<Dom>>) as unknown as z.ZodType<{ [P in K]: Dom }>;
  if (opts?.describe) schema = (schema as z.ZodType<{ [P in K]: Dom }> & { describe(d: string): z.ZodType<{ [P in K]: Dom }> }).describe(opts.describe);
  return { schema, value: (domain: Dom) => ({ [key]: domain }) as { [P in K]: Dom } };
}

/** Build a `{ [key]: Dom[] }` list envelope — `schema = z.object({ key: z.array(itemSchema) })` + the matching `value`. */
export function listEnvelope<K extends string, Dom>(
  key: K,
  itemSchema: z.ZodType<Dom>,
  opts?: { describe?: string },
): Envelope<Dom[], { [P in K]: Dom[] }> {
  let schema = z.object({ [key]: z.array(itemSchema) } as unknown as Record<K, z.ZodType<Dom[]>>) as unknown as z.ZodType<{ [P in K]: Dom[] }>;
  if (opts?.describe) schema = (schema as z.ZodType<{ [P in K]: Dom[] }> & { describe(d: string): z.ZodType<{ [P in K]: Dom[] }> }).describe(opts.describe);
  return { schema, value: (domain: Dom[]) => ({ [key]: domain }) as { [P in K]: Dom[] } };
}
