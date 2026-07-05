/**
 * A SULUK FUNCTION — the composable unit for the Suluk v4 contract, the way `Effect` is Effect-TS's composable unit. Each
 * `sulukFn` carries a SLICE of the core v4 {@link Request} (packages/core/src/types.ts) — authored with ZOD — fused with an
 * Effect impl. You maintain ONE surface (the `Request` fields: method / body / params / responses / errors / cost / …); every
 * other split is just HOW you compose these functions.
 *
 * COMPOSITION IS BUBBLING. Every layer — MODEL, SERVICE, ROUTE — is a `sulukFn`, and {@link sulukFmt} RUNS+FORMATS a layer over
 * the one below (a service `sulukFmt`s its models; a route `sulukFmt`s its services). Because every fact lives on the leaf MODEL,
 * the whole `Request` accretes upward with nothing restated:
 *   • `cost`    ← DEFINED ON THE MODEL; SUMmed up the tree (the CostModel monoid) — a service/route hand-declares none.
 *   • `errors`  ← the UNION of every layer (a model declares `errors:[NotFoundError]` ONCE; it bubbles up every layer WITHOUT
 *                 re-declaration — run channels stay permissive, like {@link effectRoute}).
 *   • response  ← the model's `ok.schema` (`wireDto(table.zodSchema)` — the db schema IS the response type); the route's `view`
 *                 WRAPS it into the wire body (`{ todo }`). `rateLimit` ← the TIGHTEST; scalars lead from the outermost layer.
 * This connects the STATE SOURCE (drizzle, in the model's query + schema) to the HOST + API REFERENCE (hono, via {@link sulukRoute},
 * which projects the merged slice onto {@link effectRoute} — inheriting the scope/cost/rate-limit derivation, the 401 guard +
 * `userId` injection, the typed-error rendering, and the emitV4 doc). Any split — controller→service→model or otherwise — is just
 * how you `sulukFmt`; nothing hardcodes the layers.
 *
 *   // MODEL — the db query + the state-source facts (schema, cost, by-id error) on its slice
 *   const findTodo   = sulukFn({ cost: readCost, errors: [NotFoundError], ok: { schema: wireDto(todo.zodSchema) },
 *                                run: (ctx, id: string) => Effect.flatMap(Db, (db) => …) });
 *   const getTodoSvc = sulukFmt(findTodo);                                        // SERVICE — runs+formats the model(s)
 *   const getTodo    = sulukFmt(                                                  // ROUTE — runs+formats the service(s) + HTTP/view
 *     sulukFn({ method: "get", path: "/api/todos/:id", roles: ["signed-in"], summary: "…", view: view("todo"),
 *               run: (ctx) => Effect.succeed(ctx.param("id")!) }),                //   controller: HTTP identity + extract the id
 *     getTodoSvc);
 *   todos.route(sulukRoute(getTodo, { provide }));                               // hono host + the api reference, whole
 */
import { Effect, Schedule, Deferred, Exit, Fiber } from "effect";
import { z } from "zod";
import type { Cause as CauseT } from "effect";
import type { Context } from "hono";
import { sumCost, type CostModel } from "@suluk/cost";
import { zodToV4 } from "@suluk/zod";
import type { SulukRateLimit, SulukDedupe, SulukSource, SulukStore, HttpStatus, SulukRunGraph, SulukRunNode, SulukRunEdge, SulukRunNodeKind, SchemaOrRef } from "@suluk/core";
import type { RouteContract, ScenarioStep } from "@suluk/hono";
import { envelope, listEnvelope, type ActionCtx, type Envelope } from "./envelope";
import { effectRoute, type EffectRoute, type Role } from "./route";
import { ValidationError, TimeoutError } from "./common";
import type { AnyHttpError } from "./errors";

const SULUK = Symbol.for("@suluk/effect/suluk-fn");

/** Methods whose effectRoute success-status default is a NO-BODY status (DELETE→204). A suluk route that returns a wire body
 *  on such a method defaults to 200 instead, so the body isn't silently dropped (e.g. a delete returning `{ deleted: true }`). */
const NO_BODY_DEFAULT_METHOD: Record<string, true> = { delete: true };

/** Any yieldable, tagged {@link httpError} instance — a suluk function's run channel accepts ALL of them (its own declared
 *  errors OR one a lower layer fails with), so a leaf's error BUBBLES UP through every layer above without re-declaration.
 *  effectRoute renders any tagged one off its own class; the `errors` SLICE (not the channel) is what documents them. */
type AnyHttpErrorInstance = CauseT.YieldableError & { readonly _tag: string };

/**
 * A VIEW — a pending response envelope keyed but not yet bound to a domain schema (`view("todo")`). At the route boundary it
 * WRAPS whatever domain schema bubbled up into the wire body `{ todo: <domain> }`, so the wrap key lives with the controller
 * while the wrapped schema comes from the model — the two provably agree (both are the SAME {@link envelope}).
 */
export type View = (domainSchema: z.ZodTypeAny) => Envelope<unknown, unknown>;

/** Build a {@link View} — wrap the bubbled-up domain schema as `{ key: <domain> }` (a single entity). */
export function view<K extends string>(key: K, opts?: { describe?: string }): View {
  return ((domainSchema: z.ZodType<unknown>) => envelope(key, domainSchema, opts)) as View;
}

/** Build a LIST {@link View} — wrap the bubbled-up ITEM schema as `{ key: <item>[] }` (a collection of the model's entity),
 *  so a list endpoint reuses the SAME model schema the single-entity one does, only arrayed. */
export function listView<K extends string>(key: K, opts?: { describe?: string }): View {
  return ((itemSchema: z.ZodType<unknown>) => listEnvelope(key, itemSchema, opts)) as View;
}

/**
 * A SLICE of the core v4 {@link Request} — the ONE surface a suluk function maintains, authored with zod. Every field maps to a
 * `Request` member (`body`→`contentSchema`, `ok`→a 2xx response, `errors`→typed 4xx/5xx, `cost`→`x-suluk-cost`, …). A function
 * declares only the fields it OWNS; the rest bubble up when {@link sulukFmt} merges the pipeline's slices.
 */
export interface RequestSlice {
  method?: RouteContract["method"];
  path?: string;
  name?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  roles?: readonly Role[];
  scope?: string;
  scopes?: string[];
  internal?: boolean;
  /** → the request body schema (`Request.contentSchema` / `request.json`). */
  body?: z.ZodTypeAny;
  /** → `Request.parameterSchema.query`. (Path params AUTO-derive from the path template's `:name`.) */
  query?: z.ZodTypeAny;
  /** validate the body against `body` and fail with a typed 400 (else pass the raw body through). */
  validateBody?: boolean;
  /** → the SUCCESS response (`Request.responses[2xx]`): the DOMAIN schema the handler yields (a `view` wraps it) + status. */
  ok?: { status?: Extract<HttpStatus, number>; schema?: z.ZodTypeAny; description?: string };
  /** the wrapper applied to the effective `ok.schema` to produce the wire body (`{ todo }`) — set by the outermost layer. */
  view?: View;
  /** → typed error responses (`Request.responses[4xx/5xx]`): the httpError CLASSES. UNIONed up the tree. */
  errors?: readonly AnyHttpError[];
  /** → `x-suluk-cost`: this layer's infra/components; SUMmed up the tree (the CostModel monoid). */
  cost?: CostModel;
  /** → `x-suluk-ratelimit`: the route takes the TIGHTEST budget any layer declares. */
  rateLimit?: SulukRateLimit;
  /** → `x-suluk-dedupe` (C110): the dedupe/result-cache budget — REAL enforcement (unlike `node.dedupe`'s graph-only
   *  reflection), `@suluk/hono`'s `enforceDedupe` reads this off the emitted route. INHERITS (own wins, else the
   *  first layer that declares one) — no "tightest" comparison the way `rateLimit` has, since two dedupe policies
   *  aren't orderable the same way. The usual source is a drizzle table's `.policy()` declaration (C111), read by
   *  `queryOne`/`queryMany`/`mutate` so a model needs no restated dedupe config at its own call site. */
  dedupe?: SulukDedupe;
  /** → `x-suluk-source`: provenance to the state source (e.g. the drizzle table a model sulukFn queries). */
  source?: SulukSource;
  /** → `x-suluk-store` (C037): a read's backing `key` (+ `params`/`ttl`) / a mutation's `invalidates`. `invalidates` ACCUMULATES
   *  (deduped union up the tree, like `errors`); `key`/`params`/`ttl`/`revalidateOnFocus`/`onSuccess` INHERIT (first-wins, a read
   *  model's key leads). Every field names a STORE name or param NAME — never a request VALUE (D1-safe, per @suluk/core). */
  store?: SulukStore;
  /** → `x-suluk-scenario`: the authored BDD steps (Given/When/Then phrases). ACCUMULATED up the tree (concat + dedup, like
   *  `errors` union — NOT inherit) so a route's merged slice holds the whole pipeline's steps; @suluk/journeys reads them. */
  steps?: readonly ScenarioStep[];
  /** → `x-suluk-run` (C104): this fn's own graph NODE (if it declared one via `node`/`ref()`) plus whatever graph its
   *  own dependents already carry. WIRED into a real pipeline shape by {@link sulukFmt} (sequential edges) /
   *  {@link sulukFmt.all} (parallel union, no new edges) — a bare {@link mergeSlices} union otherwise. Absent when no
   *  fn in the pipeline declares a node label — zero impact on every existing route. */
  runGraph?: SulukRunGraph;
  security?: RouteContract["security"];
}

/** Anything that carries a {@link RequestSlice} — every {@link SulukFn} is one; {@link sulukFmt} merges their slices. */
export interface SliceProvider {
  readonly slice: RequestSlice;
}

/**
 * A SULUK FUNCTION — `In` the run's input, `Out` its domain result (INFERRED from the Effect), `R` the undischarged Effect
 * requirement (`Db`/a service tag), settled at the route via `provide`. `slice` is this fn's own contract contribution; a
 * pipeline's merged slice comes from {@link sulukFmt}.
 */
export interface SulukFn<In, Out, R> extends SliceProvider {
  readonly [SULUK]: true;
  readonly slice: RequestSlice;
  /** the Effect impl. {@link sulukFmt} threads it in a pipeline (`fns[i].run(ctx, prevOut)`); a leaf just runs. */
  readonly run: (ctx: ActionCtx, input: In) => Effect.Effect<Out, AnyHttpErrorInstance, R>;
  /** (C105) the LIVE compensator fn, if `node.compensate` was declared — a side channel alongside `slice` (which only
   *  carries the wire-safe, resolved LABEL). {@link sulukFmt}/{@link sulukFmt.all} read this directly to invoke the
   *  real fn automatically; it is never itself serialized onto the document. */
  readonly compensate?: AnySulukFn;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnySulukFn = SulukFn<any, any, any>;

/** Type guard — is `v` a {@link SulukFn}? */
export const isSulukFn = (v: unknown): v is AnySulukFn =>
  typeof v === "object" && v !== null && (v as Record<symbol, unknown>)[SULUK] === true;

// A MODEL is just a {@link sulukFn} too — the leaf that runs the db query and carries the STATE-SOURCE facts on its slice: the
// entity `ok.schema` (`wireDto(table.zodSchema)` — the db schema IS the response type, with its constraints + `$ref` provenance),
// its `cost` (defined HERE, so it bubbles up), and any by-id `errors` ([NotFoundError]). A SERVICE `sulukFmt`s models; a ROUTE
// `sulukFmt`s services. So there is no separate model primitive — models, services, routes are all sulukFns, and {@link sulukFmt}
// runs+formats each layer over the one below.

// ── SLICE MERGE (the bubbling) ──────────────────────────────────────────────────────────────────────────────────────────

/** own field wins; else the first dep that declares it (deps are already-merged, so this is one level). */
function inherit<T>(own: T | undefined, deps: readonly RequestSlice[], pick: (s: RequestSlice) => T | undefined): T | undefined {
  if (own !== undefined) return own;
  for (const d of deps) { const v = pick(d); if (v !== undefined) return v; }
  return undefined;
}

/** MERGE a function's own slice OVER its dependencies' slices — the bubble. Scalars inherit; `errors` UNION; `cost` SUM;
 *  `rateLimit` tightens; `ok`/`view`/`source` inherit. So the outermost function's slice is the WHOLE `Request`. */
function mergeSlices(own: RequestSlice, deps: readonly RequestSlice[]): RequestSlice {
  const all = [own, ...deps];
  // errors ← deduped union across every layer.
  const seen = new Set<string>();
  const errors: AnyHttpError[] = [];
  for (const s of all) for (const E of s.errors ?? []) if (!seen.has(E.errorTag)) { seen.add(E.errorTag); errors.push(E); }
  // cost ← the SUM of every layer's declared cost (the CostModel monoid).
  const costs = all.map((s) => s.cost).filter((c): c is CostModel => c !== undefined);
  const cost = costs.length ? sumCost(costs) : undefined;
  // rate-limit ← the TIGHTEST (smallest normalized rate) any layer declares.
  const rls = all.map((s) => s.rateLimit).filter((r): r is SulukRateLimit => r !== undefined);
  const rateLimit = rls.reduce<SulukRateLimit | undefined>(
    (best, r) => (!best || r.maxRequests / r.windowMs < best.maxRequests / best.windowMs ? r : best),
    undefined,
  );
  // dedupe (C110) ← INHERIT (own wins, else the first layer that declares one) — unlike rateLimit, two dedupe
  // policies aren't orderable by "tightest", so first-wins (bottom-up: a model's table-sourced default, unless a
  // higher layer overrides it) is the honest merge rule.
  const dedupe = inherit(own.dedupe, deps, (s) => s.dedupe);
  // BDD steps ← the CONCAT of every layer's authored steps (accumulate like errors, NOT inherit), deduped by role+text so a
  //             model's Given reused across a fan-out appears once. Role-order is applied downstream (journeys sorts G<W<T).
  const steps = dedupeSteps(all.flatMap((s) => s.steps ?? []));
  // store (C037) ← `invalidates` is the deduped UNION across every layer (like errors); the query facets (key/params/ttl/
  //   revalidateOnFocus/onSuccess) INHERIT first-wins (a read model's key leads; mutations carry only invalidates). Built with
  //   ONLY the defined fields, since the top-level undefined-strip below does NOT clean nested store.* keys.
  const store = mergeStore(all);
  // run-graph (C104) ← a plain UNION here (no new edges — mergeSlices has no linear/fan-out context of its own); real
  //   sequential/parallel wiring is layered on top by sulukFmt/sulukFmt.all, which know their own composition shape.
  const runGraph = mergeGraphs(all.map((s) => s.runGraph));
  const merged: RequestSlice = {
    method: inherit(own.method, deps, (s) => s.method),
    path: inherit(own.path, deps, (s) => s.path),
    name: inherit(own.name, deps, (s) => s.name),
    summary: inherit(own.summary, deps, (s) => s.summary),
    description: inherit(own.description, deps, (s) => s.description),
    tags: inherit(own.tags, deps, (s) => s.tags),
    roles: inherit(own.roles, deps, (s) => s.roles),
    scope: inherit(own.scope, deps, (s) => s.scope),
    scopes: inherit(own.scopes, deps, (s) => s.scopes),
    internal: inherit(own.internal, deps, (s) => s.internal),
    body: inherit(own.body, deps, (s) => s.body),
    query: inherit(own.query, deps, (s) => s.query),
    validateBody: inherit(own.validateBody, deps, (s) => s.validateBody),
    ok: inherit(own.ok, deps, (s) => s.ok),
    view: inherit(own.view, deps, (s) => s.view),
    source: inherit(own.source, deps, (s) => s.source),
    security: inherit(own.security, deps, (s) => s.security),
    ...(errors.length ? { errors } : {}),
    ...(cost ? { cost } : {}),
    ...(rateLimit ? { rateLimit } : {}),
    ...(dedupe ? { dedupe } : {}),
    ...(steps.length ? { steps } : {}),
    ...(store ? { store } : {}),
    ...(runGraph ? { runGraph } : {}),
  };
  // drop undefined keys so the slice stays a clean, inspectable surface.
  return Object.fromEntries(Object.entries(merged).filter(([, v]) => v !== undefined)) as RequestSlice;
}

/** MERGE the `x-suluk-store` facet across slices: `invalidates` = deduped UNION (like errors); the QUERY facets INHERIT
 *  first-wins (a read model's `key` leads). Returns a store with ONLY its defined fields (or undefined if no slice declares one)
 *  — a clean nested surface (the caller's top-level undefined-strip does not descend into `store`). */
function mergeStore(slices: readonly RequestSlice[]): SulukStore | undefined {
  const stores = slices.map((s) => s.store).filter((v): v is SulukStore => v !== undefined);
  if (stores.length === 0) return undefined;
  const seen = new Set<string>();
  const invalidates: string[] = [];
  for (const st of stores) for (const k of st.invalidates ?? []) if (!seen.has(k)) { seen.add(k); invalidates.push(k); }
  const first = <T>(pick: (s: SulukStore) => T | undefined): T | undefined => { for (const s of stores) { const v = pick(s); if (v !== undefined) return v; } return undefined; };
  const out: SulukStore = {};
  const key = first((s) => s.key); if (key !== undefined) out.key = key;
  const params = first((s) => s.params); if (params !== undefined) out.params = params;
  const ttl = first((s) => s.ttl); if (ttl !== undefined) out.ttl = ttl;
  const revalidateOnFocus = first((s) => s.revalidateOnFocus); if (revalidateOnFocus !== undefined) out.revalidateOnFocus = revalidateOnFocus;
  const onSuccess = first((s) => s.onSuccess); if (onSuccess !== undefined) out.onSuccess = onSuccess;
  if (invalidates.length) out.invalidates = invalidates;
  return Object.keys(out).length ? out : undefined;
}

/** dedupe authored steps by role+text (a model's Given reused across a fan-out, or the auth Given, collapses to one). */
function dedupeSteps(steps: readonly ScenarioStep[]): ScenarioStep[] {
  const seen = new Set<string>();
  const out: ScenarioStep[] = [];
  for (const st of steps) { const k = `${st.role}::${st.text}`; if (!seen.has(k)) { seen.add(k); out.push(st); } }
  return out;
}

// ── RUN-GRAPH (C104): sulukFmt/sulukFmt.all capture a pipeline's node/edge SHAPE as a byproduct of composing. A leaf
// sulukFn with no `node` label contributes NOTHING here (undefined graphs stay undefined all the way up) — the whole
// facet is absent unless an author opts a node in, so an unlabeled pipeline emits byte-identical to before C104.

const edgeKey = (e: SulukRunEdge): string => `${e.on ?? "success"}:${e.errorTag ?? ""}:${e.to}<-${[...e.after].sort().join(",")}`;

/** `"success"` edges (the default — absent `on`) AND `"branch"` edges (C106) both shape the graph's ROOT/TERMINAL/
 *  RESULT computation — both are FORWARD-PROGRESS topology (exactly one of a `branch`'s cases genuinely runs, but
 *  statically all of them are reachable paths, so all count). An `"error"` edge (a `recover`/`compensate` wire,
 *  C105) is a CONDITIONAL failure-path branch, not part of the guaranteed happy-path topology, so it must never
 *  make an otherwise-terminal node look non-terminal (or an otherwise-root node look non-root) on the path that
 *  actually succeeds. */
const isForwardEdge = (e: SulukRunEdge): boolean => e.on === undefined || e.on === "success" || e.on === "branch";

/** the (nodes, edges) shape alone — {@link entryLabels}/{@link terminalLabels}/{@link lintRunGraph} compute FROM
 *  this, so they can run before a graph's own (computed) `terminals`/`resultNode` fields exist yet (e.g. while
 *  {@link mergeGraphs} is building one). */
export type NodesAndEdges = Pick<SulukRunGraph, "nodes" | "edges">;

/** A node that is ONLY reachable via an "error" edge (a `recover`/`compensate` TARGET) and never touches any
 *  success edge at all — a conditional REPLACEMENT node, not part of the pipeline's own success-path flow. Such a
 *  node must be EXCLUDED from entry/terminal computation entirely (not just "not counted as depended-on") — else
 *  it would trivially look like its own isolated root+terminal, which misrepresents the graph's actual response
 *  shape (a fallback/compensator conditionally REPLACES or SUPPLEMENTS the guarded node; it IS the guarded node's
 *  responsibility, not a second independent exit point). A node with NO edges at all (a genuine standalone node,
 *  e.g. a lone `sulukFn`) is NOT excluded — it legitimately IS the graph's own result. */
function errorOnlyTargets(g: NodesAndEdges): Set<string> {
  const forwardTouched = new Set<string>();
  for (const e of g.edges) if (isForwardEdge(e)) { forwardTouched.add(e.to); for (const a of e.after) forwardTouched.add(a); }
  const errorTargets = new Set(g.edges.filter((e) => !isForwardEdge(e)).map((e) => e.to));
  return new Set([...errorTargets].filter((l) => !forwardTouched.has(l)));
}

/** Nodes with NO upstream FORWARD-PROGRESS dependency within `g` (never the `to` of one of `g`'s own success/branch
 *  edges), EXCLUDING {@link errorOnlyTargets} — a stage's/graph's own entry points. */
function entryLabels(g: NodesAndEdges): string[] {
  const skip = errorOnlyTargets(g);
  const hasIncoming = new Set(g.edges.filter(isForwardEdge).map((e) => e.to));
  return g.nodes.map((n) => n.label).filter((l) => !skip.has(l) && !hasIncoming.has(l));
}

/** Nodes nothing in `g` depends on yet along the FORWARD-PROGRESS path (never in any success/branch edge's
 *  `after`), EXCLUDING {@link errorOnlyTargets} — a stage's exit points, wired to the NEXT stage. */
function terminalLabels(g: NodesAndEdges): string[] {
  const skip = errorOnlyTargets(g);
  const hasOutgoing = new Set(g.edges.filter(isForwardEdge).flatMap((e) => e.after));
  return g.nodes.map((n) => n.label).filter((l) => !skip.has(l) && !hasOutgoing.has(l));
}

/** the SINGLE node whose output IS the graph's result (C105) — `terminals[0]` iff there is EXACTLY one terminal,
 *  else `undefined` (an un-followed fan-out's several terminals combine into a DERIVED composite value that isn't
 *  any one node's raw output — honest absence, never a guessed "first wins"). */
function computeResultNode(terminals: readonly string[]): string | undefined {
  return terminals.length === 1 ? terminals[0] : undefined;
}

/** the WHOLE graph's own request/response shape (C106) — `input` present iff `roots.length === 1` (that root's own
 *  `input`); `output` present iff `resultNode` is defined (that node's own `output`). Both honestly absent when
 *  ambiguous, mirroring {@link computeResultNode}'s own reasoning exactly. */
function computeGraphIO(
  nodes: readonly SulukRunNode[],
  roots: readonly string[],
  resultNode: string | undefined,
): { input?: SchemaOrRef; output?: SchemaOrRef } {
  const byLabel = new Map(nodes.map((n) => [n.label, n] as const));
  const input = roots.length === 1 ? byLabel.get(roots[0]!)?.input : undefined;
  const output = resultNode !== undefined ? byLabel.get(resultNode)?.output : undefined;
  return { ...(input !== undefined ? { input } : {}), ...(output !== undefined ? { output } : {}) };
}

/** COMPUTED (C106), never authored — recompute every node's `shape` fresh from the FINAL merged edge set (never
 *  carried over from a pre-merge input graph, exactly like `terminals`/`resultNode`): `"join"` when the node
 *  declares `join`, else `"aggregate"` when it declares `aggregate`, else `"branch"` when the node is the SOURCE of
 *  at least one `"branch"` edge (a decision point), else `"task"` (an ordinary step). */
function withComputedShapes(nodes: readonly SulukRunNode[], edges: readonly SulukRunEdge[]): SulukRunNode[] {
  const branchSources = new Set(edges.filter((e) => e.on === "branch").flatMap((e) => e.after));
  return nodes.map((n): SulukRunNode => ({
    ...n,
    shape: n.join ? "join" : n.aggregate ? "aggregate" : branchSources.has(n.label) ? "branch" : "task",
  }));
}

/** VALIDATE a graph before it is ever handed back to an author or merged further (C105) — every edge's `to`/`after`
 *  and every node's `compensate` must name a REAL node in THIS SAME graph, and the graph (across BOTH success and
 *  error edges) must be ACYCLIC. Kahn's algorithm: repeatedly remove nodes whose full dependency set has already
 *  been removed; any label that's never removable sits on a cycle. Throws eagerly — the same authoring-mistake
 *  discipline {@link sulukFmt} already applies to an empty pipeline — so a malformed graph can never be silently
 *  merged further or stamped onto a real document. */
export function lintRunGraph(g: NodesAndEdges): void {
  const labels = new Set(g.nodes.map((n) => n.label));
  for (const e of g.edges) {
    if (!labels.has(e.to)) throw new Error(`x-suluk-run: edge targets unknown node "${e.to}".`);
    for (const a of e.after) if (!labels.has(a)) throw new Error(`x-suluk-run: edge from unknown node "${a}" (targeting "${e.to}").`);
  }
  for (const n of g.nodes) {
    if (n.compensate !== undefined && !labels.has(n.compensate)) {
      throw new Error(`x-suluk-run: node "${n.label}" declares compensate "${n.compensate}", which is not a node in the same graph.`);
    }
  }
  const deps = new Map<string, Set<string>>();
  for (const n of g.nodes) deps.set(n.label, new Set());
  for (const e of g.edges) for (const a of e.after) deps.get(e.to)!.add(a);
  const removed = new Set<string>();
  for (let progress = true; progress; ) {
    progress = false;
    for (const [label, ds] of deps) {
      if (!removed.has(label) && [...ds].every((d) => removed.has(d))) { removed.add(label); progress = true; }
    }
  }
  const cyclic = [...deps.keys()].filter((l) => !removed.has(l));
  if (cyclic.length) throw new Error(`x-suluk-run: cycle detected among nodes: ${cyclic.sort().join(", ")}.`);
}

/** the ONE choke point every graph-construction path finishes through (C104/C105/C106): VALIDATE (cycle + dangling
 *  reference), then recompute EVERY derived field fresh from the given (nodes, edges) — `roots`/`terminals`/
 *  `resultNode`/`input`/`output`/each node's `shape` — never carried over from a pre-merge input graph, so none of
 *  them can ever drift from the graph they're actually describing. */
function finalizeGraph(nodes: SulukRunNode[], edges: SulukRunEdge[]): SulukRunGraph {
  lintRunGraph({ nodes, edges });
  const roots = entryLabels({ nodes, edges });
  const terminals = terminalLabels({ nodes, edges });
  const resultNode = computeResultNode(terminals);
  const shapedNodes = withComputedShapes(nodes, edges);
  const { input, output } = computeGraphIO(shapedNodes, roots, resultNode);
  return {
    nodes: shapedNodes, edges: [...edges], roots, terminals,
    ...(resultNode !== undefined ? { resultNode } : {}),
    ...(input !== undefined ? { input } : {}), ...(output !== undefined ? { output } : {}),
  };
}

/** UNION any number of graphs: nodes deduped by label (first wins), edges deduped by (kind, tag, to, sorted after).
 *  No NEW edges are added — this is the generic merge a plain slice-union needs; sequential wiring is a separate
 *  step. Every derived field is recomputed fresh via {@link finalizeGraph}. */
function mergeGraphs(graphs: readonly (SulukRunGraph | undefined)[]): SulukRunGraph | undefined {
  const defined = graphs.filter((g): g is SulukRunGraph => g !== undefined);
  if (defined.length === 0) return undefined;
  const nodes = new Map<string, SulukRunNode>();
  for (const g of defined) for (const n of g.nodes) {
    const existing = nodes.get(n.label);
    if (existing === undefined) { nodes.set(n.label, n); continue; }
    // the SAME label appearing twice is fine when it's genuinely the SAME node (e.g. one shared model reused
    // across two sulukFmt.all branches) — but two DIFFERENT independently-authored nodes that merely happen to
    // share a label is a real authoring bug: silently keeping the first would drop the second's real output
    // schema/edges from the emitted x-suluk-run graph while it still genuinely executes at runtime (verified: a
    // fan-out over two same-labeled fns runs both, but a first-wins merge would report only one). Fail loud at
    // composition time (module load) instead of silently misrepresenting the graph.
    if (JSON.stringify(existing) !== JSON.stringify(n)) {
      throw new Error(
        `x-suluk-run: two different nodes share the label "${n.label}" in the same composed pipeline — ` +
          `node labels must be unique across everything composed together (rename one of them).`,
      );
    }
  }
  const seen = new Set<string>();
  const edges: SulukRunEdge[] = [];
  for (const g of defined) for (const e of g.edges) if (!seen.has(edgeKey(e))) { seen.add(edgeKey(e)); edges.push(e); }
  return finalizeGraph([...nodes.values()], edges);
}

/** SEQUENTIAL wiring (what {@link sulukFmt} does): union `prev` + `next`, then add one SUCCESS edge per `next`
 *  ENTRY node, depending on ALL of `prev`'s TERMINAL nodes — mirroring the real runtime (`next` only starts once
 *  `prev`'s whole Effect has resolved). Either side missing (no labeled node in that stage) passes the other through
 *  unchanged. Every derived field recomputed fresh via {@link finalizeGraph}. */
function wireSequential(prev: SulukRunGraph | undefined, next: SulukRunGraph | undefined): SulukRunGraph | undefined {
  if (!prev) return next;
  if (!next) return prev;
  const merged = mergeGraphs([prev, next])!;
  const prevTerminals = terminalLabels(prev);
  const nextEntries = entryLabels(next);
  const edges = [...merged.edges];
  if (prevTerminals.length && nextEntries.length) {
    const seen = new Set(edges.map(edgeKey));
    for (const to of nextEntries) {
      const e: SulukRunEdge = { to, after: prevTerminals };
      if (!seen.has(edgeKey(e))) { seen.add(edgeKey(e)); edges.push(e); }
    }
  }
  // recompute EVERY derived field fresh — the new edges just added may have retired one of `mergeGraphs`'s
  // pre-wiring terminals/roots (a `prev` terminal now has an outgoing success dependency edge, so it's no longer a
  // graph exit point; the same recompute-not-carry-over discipline applies to `roots`/`input`/`output`/`shape`).
  return finalizeGraph(merged.nodes, edges);
}

/** the DECLARED-AND-ENFORCED runtime controls a node's `run` gets wrapped in (C104/C105): a real `Effect.timeoutFail`
 *  (per ATTEMPT — a typed 504 {@link TimeoutError}, never a bare hang) inside a real `Effect.retry` (governs how many
 *  attempts, so each retried attempt gets its own fresh timeout) inside a real `Effect.catchTags` recovery (runs a
 *  declared fallback fn — on the node's OWN ORIGINAL input — only once retries are EXHAUSTED and it's still failing
 *  with one of the node's own declared, recoverable error tags). None declared ⇒ `run` is returned UNCHANGED (no
 *  wrapping overhead, byte-identical behavior to a node with no controls). `idempotent` stays DECLARED-ONLY/advisory
 *  (no dedup-key machinery exists); `compensate` is handled SEPARATELY, at the {@link sulukFmt}/{@link sulukFmt.all}
 *  pipeline level (it needs the SIBLING steps' success ledger, which a single node's own controls can't see). */
function withNodeControls<In, Out, R>(
  label: string,
  run: (ctx: ActionCtx, input: In) => Effect.Effect<Out, AnyHttpErrorInstance, R>,
  controls: {
    retry?: { times: number; delayMs?: number; whenErrorTags?: string[] };
    timeoutMs?: number;
    recover?: Record<string, { run: (ctx: ActionCtx, input: In) => Effect.Effect<Out, AnyHttpErrorInstance, R> }>;
  },
): (ctx: ActionCtx, input: In) => Effect.Effect<Out, AnyHttpErrorInstance, R> {
  const { retry, timeoutMs, recover } = controls;
  if (retry === undefined && timeoutMs === undefined && !recover) return run;
  return (ctx: ActionCtx, input: In) => {
    let eff = run(ctx, input);
    if (timeoutMs !== undefined) {
      eff = Effect.timeoutFail(eff, {
        duration: timeoutMs,
        onTimeout: () => new TimeoutError({ label, timeoutMs }) as unknown as AnyHttpErrorInstance,
      });
    }
    if (retry !== undefined) {
      // cast: the schedule's OUTPUT type (attempt count, or a tuple once `intersect`ed) is irrelevant to retry — only
      // discarded — but the branches' differing output types otherwise defeat retry's generic overload resolution.
      let schedule = (retry.delayMs !== undefined
        ? Schedule.intersect(Schedule.recurs(retry.times), Schedule.spaced(retry.delayMs))
        : Schedule.recurs(retry.times)) as Schedule.Schedule<unknown, AnyHttpErrorInstance, never>;
      // whenErrorTags (C108): intersect a REAL Schedule.recurWhile filter — the combined schedule only continues
      // while BOTH the attempt budget remains AND the failure's own tag is in the allow-list; any other tag stops
      // the schedule immediately, so Effect.retry gives up and that failure propagates on its FIRST occurrence.
      if (retry.whenErrorTags?.length) {
        const allowed = new Set(retry.whenErrorTags);
        schedule = Schedule.intersect(schedule, Schedule.recurWhile((e: AnyHttpErrorInstance) => allowed.has(e._tag))) as unknown as Schedule.Schedule<unknown, AnyHttpErrorInstance, never>;
      }
      eff = Effect.retry(eff, schedule) as Effect.Effect<Out, AnyHttpErrorInstance, R>;
    }
    if (recover) {
      const cases: Record<string, (e: AnyHttpErrorInstance) => Effect.Effect<Out, AnyHttpErrorInstance, R>> = {};
      for (const [tag, fallback] of Object.entries(recover)) cases[tag] = () => fallback.run(ctx, input);
      eff = Effect.catchTags(eff, cases) as Effect.Effect<Out, AnyHttpErrorInstance, R>;
    }
    return eff;
  };
}

/** Build the SEED `x-suluk-run` graph for a single node (C104/C105): this node alone, UNIONed with each `recover`
 *  fallback's own graph (wired in via a TAGGED "error" edge) and the `compensate` fn's own graph (wired in via an
 *  UNTAGGED "error" edge) — so a fallback/compensator that is itself a labeled sub-pipeline brings its whole shape
 *  along. A fallback/compensator with NO `node` label of its own contributes no edge (it still runs for real via
 *  the live fn reference — only the DATA can't reference an unlabeled node, the same "absent unless labeled" honesty
 *  every other field here already has). When a fallback/compensator's own graph has multiple ENTRY nodes (a genuine
 *  multi-step sub-pipeline, not just a leaf), only its FIRST entry is wired as the edge target / `compensate` label —
 *  a documented simplification; the full sub-pipeline still executes for real either way (composition, not the
 *  graph DATA, drives execution). */
function seedNodeGraph(
  self: SulukRunNode,
  recover: ReadonlyArray<{ tag: string; fallback: AnySulukFn }>,
  compensate: AnySulukFn | undefined,
): SulukRunGraph {
  const selfGraph = finalizeGraph([self], []);
  const extraGraphs = [...recover.map((r) => r.fallback.slice.runGraph), ...(compensate ? [compensate.slice.runGraph] : [])];
  const merged = mergeGraphs([selfGraph, ...extraGraphs])!;
  const edges: SulukRunEdge[] = [...merged.edges];
  const recoverPolicy: { errorTag: string; to: string }[] = [];
  for (const { tag, fallback } of recover) {
    const entry = fallback.slice.runGraph ? entryLabels(fallback.slice.runGraph)[0] : undefined;
    if (entry !== undefined) { edges.push({ to: entry, after: [self.label], on: "error", errorTag: tag }); recoverPolicy.push({ errorTag: tag, to: entry }); }
  }
  let compensateLabel: string | undefined;
  if (compensate) {
    compensateLabel = compensate.slice.runGraph ? entryLabels(compensate.slice.runGraph)[0] : undefined;
    if (compensateLabel !== undefined) edges.push({ to: compensateLabel, after: [self.label], on: "error" });
  }
  const nodes = merged.nodes.map((n) => {
    if (n.label !== self.label) return n;
    return { ...n, ...(compensateLabel !== undefined ? { compensate: compensateLabel } : {}), ...(recoverPolicy.length ? { recover: recoverPolicy } : {}) };
  });
  return finalizeGraph(nodes, edges);
}

// ── THE CONSTRUCTOR ─────────────────────────────────────────────────────────────────────────────────────────────────────

/**
 * Author a {@link SulukFn} — a LEAF: its own contract slice + `run`. It composes with OTHER sulukFns only through {@link sulukFmt}
 * (linear pipeline) / {@link sulukFmt.all} (fan-out); there is no in-constructor `deps` — a layer never reaches into another. `Out`
 * is INFERRED from the Effect. The run channel is PERMISSIVE (any tagged httpError) so a pipeline may run a lower fn that fails
 * without re-declaring the error — `errors` only DOCUMENTS this fn's own new failure modes, and every fn's errors bubble via the
 * merge. `Errs` types this fn's own declared throws.
 */
export function sulukFn<
  In = void,
  Out = unknown,
  R = never,
  const Errs extends readonly AnyHttpError[] = readonly [],
>(def: {
  method?: RouteContract["method"];
  path?: string;
  name?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  roles?: readonly Role[];
  scope?: string;
  scopes?: string[];
  internal?: boolean;
  body?: z.ZodType<In>;
  query?: z.ZodTypeAny;
  validateBody?: boolean;
  /** the response schema BEFORE any `view` wrapping — a model's ENTITY schema. Decoupled from `Out`: a list model returns
   *  `Out = Item[]` but its `ok.schema` is the `Item` (a `listView` arrays it), so this is `z.ZodTypeAny`, not `z.ZodType<Out>`. */
  ok?: { status?: Extract<HttpStatus, number>; schema?: z.ZodTypeAny; description?: string };
  view?: View;
  errors?: Errs;
  cost?: CostModel;
  rateLimit?: SulukRateLimit;
  /** → `x-suluk-dedupe` (C110), REAL enforcement via `@suluk/hono`'s `enforceDedupe` — see `RequestSlice.dedupe`.
   *  Usually sourced from a drizzle table's `.policy()` declaration (C111) rather than restated here. */
  dedupe?: SulukDedupe;
  source?: SulukSource;
  security?: RouteContract["security"];
  /** the reactive-STORE facet (C037) — a READ model declares `{ key, params?, ttl? }` (it BACKS the store); a WRITE model
   *  declares `{ invalidates: [...] }`. Bubbles up the pipeline (invalidates union, key first-wins) → the route's `x-suluk-store`. */
  store?: SulukStore;
  /** the authored BDD step(s) this fn contributes — a MODEL its `given` precondition, a CONTROLLER its `when` action, either
   *  an outcome `then`. Accumulated up the pipeline by {@link sulukFmt}; drives @suluk/journeys's generated scenario. */
  step?: ScenarioStep | readonly ScenarioStep[];
  /** OPT IN to the `x-suluk-run` pipeline graph (C104) — a stable LABEL for this fn as a graph node (referenced by
   *  edges once composed via `sulukFmt`/`sulukFmt.all`) + what KIND of thing it is (default `"internal"` — this fn IS
   *  the implementation). Omit entirely for an ordinary fn that doesn't need to show up in the graph (the default —
   *  zero impact on the emitted document). `retry`/`timeoutMs`/`recover` are DECLARED-AND-ENFORCED: `run` gets REALLY
   *  wrapped in `Effect.retry`/`Effect.timeoutFail`/`Effect.catchTags` (a timeout fails typed, as {@link TimeoutError},
   *  a documented 504). `idempotent` stays DECLARED-ONLY (advisory) — no dedup-key machinery reads it. `compensate` is
   *  DECLARED-AND-ENFORCED (C105) too, but at the {@link sulukFmt}/{@link sulukFmt.all} pipeline level — see there. */
  node?: {
    label: string;
    kind?: SulukRunNodeKind;
    from?: string;
    retry?: { times: number; delayMs?: number; whenErrorTags?: string[] };
    timeoutMs?: number;
    /** run this FALLBACK fn (same `In`/`Out`/`R` as this node) instead, keyed by which of THIS node's OWN declared
     *  errors (or `"TimeoutError"`, always available) it fails with — but only once `retry` (if any) is EXHAUSTED
     *  and still failing with a recoverable tag. Type-scoped to THIS node's own `errors`: an unrecognized tag is a
     *  compile error, so a `recover` entry can never silently target a failure this node can't actually raise. */
    recover?: Partial<Record<Errs[number]["errorTag"] | "TimeoutError", SulukFn<In, Out, R>>>;
    idempotent?: boolean;
    /** DECLARED-ONLY (advisory, C108) — see {@link SulukRunNode.effect}/`.requiresIdempotencyKey`/
     *  `.idempotencyKeySource`'s doc comments; NONE of the three are enforced by anything here (no dedup-store/
     *  result-cache machinery exists in this package). */
    effect?: "read" | "write" | "emit";
    requiresIdempotencyKey?: boolean;
    idempotencyKeySource?: { header: string } | { bodyField: string };
    /** DECLARED-ONLY (advisory, C110) — see {@link SulukRunNode.dedupe}: mirrors the dedupe/result-cache budget
     *  `@suluk/hono`'s `enforceDedupe` REALLY enforces off the operation's `x-suluk-dedupe` facet. Not enforced
     *  here — this is a graph-level reflection of the same policy, not a second enforcement point. */
    dedupe?: { ttlMs: number; scope?: string };
    /** run this COMPENSATOR fn (given THIS node's own original input) automatically if a LATER step in the SAME
     *  pipeline fails after this node itself already succeeded — see {@link sulukFmt}/{@link sulukFmt.all}. The
     *  compensator's own failure is swallowed (best-effort; never masks the real error). */
    compensate?: SulukFn<In, unknown, R>;
  };
  run: (ctx: ActionCtx, input: In) => Effect.Effect<Out, InstanceType<Errs[number]> | AnyHttpErrorInstance, R>;
}): SulukFn<In, Out, R> {
  // a declared `timeoutMs` means the run can ALSO fail with the typed TimeoutError — fold it into the same errors
  // list that documents the node (and, via mergeSlices, the route's responses) so the 504 isn't a silent surprise.
  const nodeErrors: readonly AnyHttpError[] | undefined =
    def.node?.timeoutMs !== undefined ? [...(def.errors ?? []), TimeoutError] : def.errors;
  const recoverEntries = Object.entries(def.node?.recover ?? {}) as [string, AnySulukFn][];
  const compensateFn = def.node?.compensate as AnySulukFn | undefined;
  const own: RequestSlice = {
    method: def.method, path: def.path, name: def.name, summary: def.summary, description: def.description,
    tags: def.tags, roles: def.roles, scope: def.scope, scopes: def.scopes, internal: def.internal,
    body: def.body, query: def.query, validateBody: def.validateBody, ok: def.ok, view: def.view,
    errors: nodeErrors, cost: def.cost, rateLimit: def.rateLimit, dedupe: def.dedupe, source: def.source, security: def.security, store: def.store,
    steps: def.step ? (Array.isArray(def.step) ? def.step : [def.step]) : undefined,
    runGraph: def.node
      ? seedNodeGraph(
          {
            label: def.node.label,
            kind: def.node.kind ?? "internal",
            ...(def.node.from ? { from: def.node.from } : {}),
            ...(nodeErrors?.length ? { errors: nodeErrors.map((E) => E.errorTag) } : {}),
            ...(def.body ? { input: zodToV4(def.body).schema } : {}),
            ...(def.ok?.schema ? { output: zodToV4(def.ok.schema).schema } : {}),
            ...(def.node.retry ? { retry: def.node.retry } : {}),
            ...(def.node.timeoutMs !== undefined ? { timeoutMs: def.node.timeoutMs } : {}),
            ...(def.node.idempotent !== undefined ? { idempotent: def.node.idempotent } : {}),
            ...(def.node.effect ? { effect: def.node.effect } : {}),
            ...(def.node.requiresIdempotencyKey !== undefined ? { requiresIdempotencyKey: def.node.requiresIdempotencyKey } : {}),
            ...(def.node.idempotencyKeySource ? { idempotencyKeySource: def.node.idempotencyKeySource } : {}),
            ...(def.node.dedupe ? { dedupe: def.node.dedupe } : {}),
          },
          recoverEntries.map(([tag, fallback]) => ({ tag, fallback })),
          compensateFn,
        )
      : undefined,
  };
  const slice = mergeSlices(own, []); // normalize (drop undefined keys) — nothing to bubble; sulukFmt does the composing.
  // every declared error is a yieldable httpError, so widening the run's channel to `AnyHttpErrorInstance` is sound (the extra
  // member `InstanceType<Errs[number]>` is only nominally distinct from `YieldableError` at the type level).
  const rawRun = def.run as SulukFn<In, Out, R>["run"];
  const recoverForControls = recoverEntries.length
    ? Object.fromEntries(recoverEntries.map(([tag, fallback]) => [tag, fallback]))
    : undefined;
  const run = def.node
    ? withNodeControls(def.node.label, rawRun, { retry: def.node.retry, timeoutMs: def.node.timeoutMs, recover: recoverForControls })
    : rawRun;
  return { [SULUK]: true, slice, run, ...(compensateFn ? { compensate: compensateFn } : {}) };
}

// ── THE PLACEHOLDER OP (C104) ───────────────────────────────────────────────────────────────────────────────────────────

/** A {@link ref} carries its declared `input`/`output` schemas alongside the ordinary {@link SulukFn} shape — read by a
 *  future stub-generator (never stamped onto the emitted document; the schemas stay in-process, local to this file). */
export interface RefFn<In, Out> extends SulukFn<In, Out, never> {
  readonly input?: z.ZodType<In>;
  readonly output?: z.ZodType<Out>;
}

/**
 * A PLACEHOLDER op — a named node in the `x-suluk-run` graph for something not (yet) fully implemented HERE: an
 * external service call, a generic/library op, or a package-imported function. Composes into {@link sulukFmt} /
 * {@link sulukFmt.all} exactly like a real {@link sulukFn} (same `[SULUK]`/`slice`/`run` shape) — so a pipeline's
 * SHAPE can be authored, read, and fed to `@suluk/journeys` before every step is written.
 *
 * Until a real `run` is supplied, calling it THROWS (`Effect.die`) — this is a design-time node, not something meant
 * to serve traffic. Once the real op exists, swap the `ref(...)` call for the real `sulukFn`/import; the graph and
 * everything composed around it are unaffected (same label, same position in the pipeline).
 *
 *   const charge = ref("payments.charge", { kind: "external", from: "stripe", input: ChargeInput, output: ChargeResult });
 *   const checkout = sulukFmt(fetchCart, charge);   // `charge` is a real graph node NOW; its body can be written later.
 */
export function ref<
  In = unknown,
  Out = unknown,
  const Errs extends readonly AnyHttpError[] = readonly [],
>(
  label: string,
  opts: {
    kind: SulukRunNodeKind;
    /** advisory: a module path, npm package name, or external service name this op runs against. */
    from?: string;
    input?: z.ZodType<In>;
    output?: z.ZodType<Out>;
    /** DECLARED-AND-ENFORCED: once a real `run` exists, wrap it in a real `Effect.retry`/`Effect.timeoutFail` (a
     *  timeout fails typed, as {@link TimeoutError}) — the exact same runtime controls a `sulukFn`'s `node` gets.
     *  `whenErrorTags` (C108) is ALSO enforced — see `sulukFn`'s `node.retry` doc comment. */
    retry?: { times: number; delayMs?: number; whenErrorTags?: string[] };
    timeoutMs?: number;
    /** this op's own declared error tags (mirrors `sulukFn`'s `errors`) — lets `recover` be type-scoped to them. */
    errors?: Errs;
    /** run this FALLBACK op instead, keyed by which of THIS op's OWN declared errors (or `"TimeoutError"`) the real
     *  `run` fails with, once `retry` (if any) is exhausted — see `sulukFn`'s `node.recover`. */
    recover?: Partial<Record<Errs[number]["errorTag"] | "TimeoutError", SulukFn<In, Out, never>>>;
    /** DECLARED-ONLY (advisory) — see {@link SulukRunNode}'s doc comments; not enforced by anything here. */
    idempotent?: boolean;
    /** DECLARED-ONLY (advisory, C108) — see `sulukFn`'s `node.effect`/`.requiresIdempotencyKey`/`.idempotencyKeySource`. */
    effect?: "read" | "write" | "emit";
    requiresIdempotencyKey?: boolean;
    idempotencyKeySource?: { header: string } | { bodyField: string };
    /** DECLARED-ONLY (advisory, C110) — see `sulukFn`'s `node.dedupe`. */
    dedupe?: { ttlMs: number; scope?: string };
    /** DECLARED-AND-ENFORCED (C105) — see `sulukFn`'s `node.compensate`; run automatically by the enclosing
     *  `sulukFmt`/`sulukFmt.all` if a later pipeline step fails after THIS op already succeeded. */
    compensate?: SulukFn<In, unknown, never>;
    /** supply the REAL implementation once written; omit while this is still a stub. */
    run?: (ctx: ActionCtx, input: In) => Effect.Effect<Out, AnyHttpErrorInstance, never>;
  },
): RefFn<In, Out> {
  const stub = !opts.run;
  const nodeErrors: readonly AnyHttpError[] | undefined =
    opts.timeoutMs !== undefined ? [...(opts.errors ?? []), TimeoutError] : opts.errors;
  const recoverEntries = Object.entries(opts.recover ?? {}) as [string, AnySulukFn][];
  const compensateFn = opts.compensate as AnySulukFn | undefined;
  const slice: RequestSlice = {
    ...(nodeErrors?.length ? { errors: nodeErrors } : {}),
    runGraph: seedNodeGraph(
      {
        label,
        kind: opts.kind,
        ...(opts.from ? { from: opts.from } : {}),
        ...(stub ? { stub: true } : {}),
        ...(nodeErrors?.length ? { errors: nodeErrors.map((E) => E.errorTag) } : {}),
        ...(opts.input ? { input: zodToV4(opts.input).schema } : {}),
        ...(opts.output ? { output: zodToV4(opts.output).schema } : {}),
        ...(opts.retry ? { retry: opts.retry } : {}),
        ...(opts.timeoutMs !== undefined ? { timeoutMs: opts.timeoutMs } : {}),
        ...(opts.idempotent !== undefined ? { idempotent: opts.idempotent } : {}),
        ...(opts.effect ? { effect: opts.effect } : {}),
        ...(opts.requiresIdempotencyKey !== undefined ? { requiresIdempotencyKey: opts.requiresIdempotencyKey } : {}),
        ...(opts.idempotencyKeySource ? { idempotencyKeySource: opts.idempotencyKeySource } : {}),
        ...(opts.dedupe ? { dedupe: opts.dedupe } : {}),
      },
      recoverEntries.map(([tag, fallback]) => ({ tag, fallback })),
      compensateFn,
    ),
  };
  const rawRun = (opts.run ??
    (() => Effect.die(new Error(`ref("${label}"): not implemented yet — write this op (or generate its stub), or pass a real \`run\` to ref().`)))
  ) as SulukFn<In, Out, never>["run"];
  const recoverForControls = (recoverEntries.length
    ? Object.fromEntries(recoverEntries.map(([tag, fallback]) => [tag, fallback]))
    : undefined) as Record<string, { run: (ctx: ActionCtx, input: In) => Effect.Effect<Out, AnyHttpErrorInstance, never> }> | undefined;
  const run = withNodeControls<In, Out, never>(label, rawRun, { retry: opts.retry, timeoutMs: opts.timeoutMs, recover: recoverForControls });
  return {
    [SULUK]: true, slice, run,
    ...(opts.input ? { input: opts.input } : {}), ...(opts.output ? { output: opts.output } : {}),
    ...(compensateFn ? { compensate: compensateFn } : {}),
  };
}

/** one entry in a pipeline's success LEDGER (C105) — recorded right after a step SUCCEEDS, so automatic compensation
 *  knows exactly which steps to undo (and with what original input) if a LATER step fails. */
interface CompensationLedgerEntry {
  readonly fn: AnySulukFn;
  readonly input: unknown;
}

/** DECLARED-AND-ENFORCED automatic compensation (C105): walk `ledger` in REVERSE, running every entry's OWN
 *  `.compensate` fn (if declared) against the ORIGINAL input that entry's guarded step received. Best-effort — each
 *  compensator's own failure is swallowed (`Effect.catchAll` → `Effect.void`) so a broken rollback can never mask the
 *  REAL failure that triggered compensation in the first place. Sequential (not concurrent): undoing in the mirror
 *  order effects were applied is the safer default when a later effect may depend on an earlier one still standing. */
function compensateReverse(ledger: readonly CompensationLedgerEntry[], ctx: ActionCtx): Effect.Effect<void, never, never> {
  const toCompensate = [...ledger].reverse().filter((e) => e.fn.compensate !== undefined);
  if (toCompensate.length === 0) return Effect.void;
  return Effect.forEach(
    toCompensate,
    (e) => Effect.catchAll(e.fn.compensate!.run(ctx, e.input as never), () => Effect.void),
    { discard: true },
  ) as Effect.Effect<void, never, never>;
}

// ── CONCURRENCY PRIMITIVES FOR JOIN POLICIES (C106) ─────────────────────────────────────────────────────────────────────
// Effect has no single built-in combinator for either of these: `Effect.raceAll` races on FIRST SETTLEMENT (a losing
// branch that merely FAILS still "wins" the race over a branch that later succeeds — wrong for "any"); `Effect.
// firstSuccessOf` runs its candidates SEQUENTIALLY, not concurrently. Both primitives below use `Effect.exit` (never
// `Effect.matchEffect`, which only observes the plain Fail/E channel) so a branch that DIES or is externally
// INTERRUPTED is still correctly counted — a matchEffect-based version would let such a branch silently vanish from
// the accounting and hang the race forever if it happened to be the last one needed to settle.

/** Fork ALL `effects` concurrently. The FIRST one to SUCCEED wins; a branch failing (Fail, Die, OR Interrupt — via
 *  `Effect.exit`) does NOT end the race unless every branch has now failed, in which case the race fails with the
 *  LAST branch's cause. Whichever branches are still running once a winner is found (or once all have failed) are
 *  INTERRUPTED via `Fiber.interruptAll` (a safe no-op for any fiber that already finished). */
function raceForSuccess<Out, R>(
  effects: readonly Effect.Effect<Out, AnyHttpErrorInstance, R>[],
): Effect.Effect<Out, AnyHttpErrorInstance, R> {
  if (effects.length === 0) return Effect.die(new Error("raceForSuccess: needs at least one candidate."));
  return Effect.gen(function* () {
    const winner = yield* Deferred.make<Out, AnyHttpErrorInstance>();
    let remaining = effects.length;
    const fibers = yield* Effect.forEach(
      effects,
      (eff) => Effect.fork(Effect.exit(eff).pipe(Effect.flatMap((exit) => Effect.suspend(() => {
        if (Exit.isSuccess(exit)) return Deferred.succeed(winner, exit.value);
        remaining--;
        return remaining === 0 ? Deferred.failCause(winner, exit.cause) : Effect.void;
      })))),
      { concurrency: "unbounded" },
    );
    return yield* Deferred.await(winner).pipe(Effect.ensuring(Fiber.interruptAll(fibers)));
  });
}

/** Fork ALL `effects` concurrently. Once `quorum` of them have SUCCEEDED, resolve with an array of those `quorum`
 *  results (in completion order) and INTERRUPT every still-running branch. Fails eagerly — before every branch
 *  settles — the instant quorum becomes mathematically unreachable (more than `effects.length - quorum` have
 *  failed). Degenerate `quorum` values are resolved BEFORE forking anything (a quorum of 0 or less is trivially met
 *  by the empty array; a quorum exceeding the candidate count can never be met), so neither can ever hang waiting
 *  on a settle event that was only ever checked from the opposite (success-only / failure-only) branch. */
function raceForQuorum<Out, R>(
  effects: readonly Effect.Effect<Out, AnyHttpErrorInstance, R>[],
  quorum: number,
): Effect.Effect<Out[], AnyHttpErrorInstance, R> {
  const total = effects.length;
  if (quorum <= 0) return Effect.succeed([]);
  if (quorum > total) return Effect.die(new Error(`raceForQuorum: quorum ${quorum} exceeds ${total} candidate(s).`));
  return Effect.gen(function* () {
    const winner = yield* Deferred.make<Out[], AnyHttpErrorInstance>();
    const successes: Out[] = [];
    let failures = 0;
    const fibers = yield* Effect.forEach(
      effects,
      (eff) => Effect.fork(Effect.exit(eff).pipe(Effect.flatMap((exit) => Effect.suspend(() => {
        if (Exit.isSuccess(exit)) {
          successes.push(exit.value);
          return successes.length >= quorum ? Deferred.succeed(winner, successes.slice(0, quorum)) : Effect.void;
        }
        failures++;
        return total - failures < quorum ? Deferred.failCause(winner, exit.cause) : Effect.void;
      })))),
      { concurrency: "unbounded" },
    );
    return yield* Deferred.await(winner).pipe(Effect.ensuring(Fiber.interruptAll(fibers)));
  });
}

// ── THE PIPELINE FORMATTER ──────────────────────────────────────────────────────────────────────────────────────────────

/**
 * `sulukFmt` — RUN a pipeline of {@link sulukFn}s and FORMAT (merge) their slices into one. This is how a layer composes the one
 * below it: a SERVICE `sulukFmt`s its MODELS, a ROUTE `sulukFmt`s its SERVICES — and because every fact (schema / cost / errors)
 * lives on the leaf model, it BUBBLES up through every layer, so a service/route hand-declares NONE of them.
 *   • RUN — the fns thread left→right: `fns[0].run(ctx, input)` → `fns[1].run(ctx, out0)` → … The terminal fn's output is the
 *     response domain (a route's `view` wraps it). A single-fn pipeline is just that fn, run.
 *   • FORMAT — every fn's slice MERGES (errors UNION, cost SUM, rate-limit tightest, response schema + scalars inherit). The
 *     FIRST fn's scalars win (so a route's controller — its `method`/`path`/`view` — leads; the model's `ok`/`cost`/`errors`
 *     follow). Define costs in the model and they SUM up the tree here with nothing restated.
 * Returns a {@link SulukFn}, so pipelines nest (a route is `sulukFmt(controller, service)` where `service = sulukFmt(model)`).
 */
export function sulukFmt<In, Out, R>(a: SulukFn<In, Out, R>): SulukFn<In, Out, R>;
export function sulukFmt<In, A, Out, R1, R2>(a: SulukFn<In, A, R1>, b: SulukFn<A, Out, R2>): SulukFn<In, Out, R1 | R2>;
export function sulukFmt<In, A, B, Out, R1, R2, R3>(a: SulukFn<In, A, R1>, b: SulukFn<A, B, R2>, c: SulukFn<B, Out, R3>): SulukFn<In, Out, R1 | R2 | R3>;
export function sulukFmt(...fns: AnySulukFn[]): AnySulukFn;
export function sulukFmt(...fns: AnySulukFn[]): AnySulukFn {
  if (fns.length === 0) throw new Error("sulukFmt: needs at least one sulukFn to run + format.");
  const slice = fns.reduce<RequestSlice>((acc, f) => mergeSlices(acc, [f.slice]), {});
  // run-graph (C104) ← SEQUENTIAL wiring, matching the run loop below exactly: fns[i] only starts once fns[i-1]'s
  // whole Effect (and everything IT already wired) has resolved, so wire fns[i]'s entries after fns[i-1]'s terminals.
  const runGraph = fns.slice(1).reduce<SulukRunGraph | undefined>((g, f) => wireSequential(g, f.slice.runGraph), fns[0].slice.runGraph);
  if (runGraph) slice.runGraph = runGraph; else delete slice.runGraph;
  // compensation (C105) is opt-in per-fn: a pipeline where NOTHING declares `compensate` runs the plain, zero-overhead
  // loop — byte-identical to before C105. Only when at least one fn declares it does the run build a success LEDGER
  // (pushed to right after each step SUCCEEDS, so it always reflects exactly which steps really completed) and wrap
  // the whole chain in ONE `Effect.tapErrorCause` that walks it in reverse on ANY downstream failure — a typed
  // error OR a defect (a raw throw), since a crash after a real side effect still needs its rollback to run.
  const anyCompensate = fns.some((f) => f.compensate !== undefined);
  const run = (anyCompensate
    ? (ctx: ActionCtx, input: unknown) => {
        const ledger: CompensationLedgerEntry[] = [];
        let eff = Effect.tap(fns[0].run(ctx, input as never), () => Effect.sync(() => ledger.push({ fn: fns[0], input })));
        for (let i = 1; i < fns.length; i++) {
          const next = fns[i];
          eff = Effect.flatMap(eff, (out) =>
            Effect.tap(next.run(ctx, out as never), () => Effect.sync(() => ledger.push({ fn: next, input: out }))));
        }
        // tapErrorCause (not tapError): a LATER step that dies (an ordinary throw/defect, not a typed httpError
        // failure) must still trigger rollback of everything the ledger already recorded as succeeded — tapError
        // only observes the typed Fail channel and would silently skip compensation on exactly the failure mode
        // (an unexpected crash after a real side effect landed) C105 exists to protect against. Like tapError,
        // tapErrorCause re-raises the ORIGINAL cause automatically regardless of what the tap callback does.
        return Effect.tapErrorCause(eff, () => compensateReverse(ledger, ctx));
      }
    : (ctx: ActionCtx, input: unknown) => {
        let eff = fns[0].run(ctx, input as never);
        for (let i = 1; i < fns.length; i++) {
          const next = fns[i];
          eff = Effect.flatMap(eff, (out) => next.run(ctx, out as never));
        }
        return eff;
      }
  ) as AnySulukFn["run"];
  return { [SULUK]: true, slice, run };
}

/** the domain output of a sulukFn — for typing the fan-out's keyed body. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OutOf<Fn> = Fn extends SulukFn<any, infer O, any> ? O : never;

/** the input of a sulukFn — for typing {@link sulukFmt.branch}'s shared discriminator input. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InOf<Fn> = Fn extends SulukFn<infer I, any, any> ? I : never;

/** a rough, comparable TOTAL for a CostModel — its own `estimateMicroUsd` if declared, else the sum of its `infra`
 *  meter values. Used ONLY by {@link sulukFmt.branch}'s MAX-across-cases cost rule (below); every other combinator
 *  keeps the existing SUM-across-branches monoid (`@suluk/cost`'s `sumCost`). */
function costTotal(c: CostModel): number {
  if (c.estimateMicroUsd !== undefined) return c.estimateMicroUsd;
  return Object.values(c.infra ?? {}).reduce((sum: number, v) => sum + (v ?? 0), 0);
}

/** the costliest of `models` by {@link costTotal} — the WORST-CASE reachable cost. Unlike `sumCost` (right for
 *  branches that all genuinely execute, e.g. a fan-out or a concurrent race), `sulukFmt.branch` runs EXACTLY ONE
 *  of its cases per call — summing every case's cost would overstate the operation's real, billed `x-suluk-cost`. */
function maxCost(models: readonly (CostModel | undefined)[]): CostModel | undefined {
  const defined = models.filter((m): m is CostModel => m !== undefined);
  if (defined.length === 0) return undefined;
  return defined.reduce((best, m) => (costTotal(m) > costTotal(best) ? m : best));
}

/** For a {@link sulukFmt.branch} field that ISN'T safely summarizable across mutually-exclusive cases the way
 *  `cost` is (a rate-limit/dedupe budget is a discrete choice — a header NAME, a window — not a quantity `maxCost`
 *  can take the worst-case of): keep the value ONLY if every case that declares one declares the EXACT SAME value
 *  (no real ambiguity), else `undefined` — the same "honest absence over a silently-wrong guess" rule
 *  `SulukRunGraph.resultNode` already uses when a graph's true terminal is ambiguous. Declaration-order-based
 *  first-wins (what `mergeSlices`' generic `inherit()` does) would silently pick an ARBITRARY case's budget and
 *  enforce it against every request regardless of which case actually runs — worse than omitting it. */
function agreeOrUndefined<T>(values: readonly (T | undefined)[]): T | undefined {
  const defined = values.filter((v): v is T => v !== undefined);
  if (defined.length === 0) return undefined;
  const first = JSON.stringify(defined[0]);
  return defined.every((v) => JSON.stringify(v) === first) ? defined[0] : undefined;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace sulukFmt {
  /**
   * `sulukFmt.all` — FAN OUT: run every branch on the SAME input, then FORMAT their keyed outputs into ONE body. Where
   * {@link sulukFmt} is a linear pipeline (thread output→input), this is the parallel merge — the second combinator so any
   * composition is a sulukFmt, never `deps`. Each branch's `ok.schema` becomes a property of the merged response schema
   * (`{ todo: TodoItem, count: number }`), so the composite body is DERIVED, never restated. errors UNION, cost SUM across branches.
   *
   *   sulukFmt.all({ todo: getTodo, count: countTodos })   // → { todo, count }; schema + errors + cost all bubble
   */
  export function all<T extends Record<string, AnySulukFn>, P = { [K in keyof T]: OutOf<T[K]> }>(
    branches: T,
    opts?: { label?: string; project?: (outs: { [K in keyof T]: OutOf<T[K]> }) => P; describe?: string },
  ): SulukFn<unknown, P, ReqOf<T[keyof T]>> {
    const entries = Object.entries(branches);
    const okShape: Record<string, z.ZodTypeAny> = {};
    const seen = new Set<string>();
    const errors: AnyHttpError[] = [];
    const costs: CostModel[] = [];
    const allSteps: ScenarioStep[] = [];
    // store: a fan-out is a COMPOSITE read/multi with no single query key, so we UNION only the branches' `invalidates`
    //   (a write fan-out's effects still bubble) and DROP `key`/`params`/… (they don't compose — the composite gets its own
    //   key at the controller if it needs one). This is why a shared read model's `key` never leaks into a detail route.
    const seenInv = new Set<string>();
    const invalidates: string[] = [];
    for (const [key, fn] of entries) {
      const s = fn.slice;
      if (s.ok?.schema) okShape[key] = s.ok.schema as z.ZodTypeAny;
      for (const E of s.errors ?? []) if (!seen.has(E.errorTag)) { seen.add(E.errorTag); errors.push(E); }
      if (s.cost) costs.push(s.cost);
      allSteps.push(...(s.steps ?? []));
      for (const k of s.store?.invalidates ?? []) if (!seenInv.has(k)) { seenInv.add(k); invalidates.push(k); }
    }
    const steps = dedupeSteps(allSteps);
    // run-graph (C104) ← PARALLEL union: every branch runs on the SAME input, so there's no dependency edge BETWEEN
    //   them (unlike sulukFmt's sequential wiring) — each branch's own internal shape (if any) is preserved as-is.
    // C106: opts.label ADDITIONALLY inserts ONE synthetic node (shape "join"+"aggregate" — join:{policy:"all"},
    //   aggregate:{strategy:"object"} or, when `opts.project` (C107) supplies a real merge FUNCTION instead of the
    //   default keyed-object merge, {strategy:"custom"} — as the fan-out's SOLE terminal, wired after every branch's
    //   own terminal(s) — so a LABELED fan-out now has a defined `resultNode`; an unlabeled one stays exactly as
    //   before (multiple terminals, no resultNode). aggregateProjection (C107) is COMPUTED for the default "object"
    //   strategy (key → the branch's own node label, only for labeled branches) or, for "custom", the author's own
    //   `opts.describe` prose (there is no derivable field↔source mapping for an arbitrary project function).
    const aggregateProjection: Record<string, string> | string | undefined = opts?.project
      ? opts.describe
      : (() => {
          const m: Record<string, string> = {};
          for (const [key, fn] of entries) { const g = fn.slice.runGraph; const l = g ? entryLabels(g)[0] : undefined; if (l !== undefined) m[key] = l; }
          return Object.keys(m).length ? m : undefined;
        })();
    const runGraph = wireJoinNode(mergeGraphs(entries.map(([, fn]) => fn.slice.runGraph)), opts?.label, { policy: "all" }, { strategy: opts?.project ? "custom" : "object" }, aggregateProjection);
    const slice: RequestSlice = {
      // `project` reshapes the merge into something a zod schema can't be derived for automatically — leave
      // `ok.schema` undocumented in that case (the same honest "author redeclares it at a higher layer" boundary
      // sulukFmt.quorum's Out[] doesn't need, since z.array is always derivable but an arbitrary project isn't).
      ...(opts?.project ? {} : { ok: { schema: z.object(okShape) } }),
      ...(errors.length ? { errors } : {}),
      ...(costs.length ? { cost: sumCost(costs) } : {}),
      ...(steps.length ? { steps } : {}),
      ...(invalidates.length ? { store: { invalidates } } : {}),
      ...(runGraph ? { runGraph } : {}),
    };
    // compensation (C105), fan-out shape: each branch's OWN effect (not the combined `Effect.all`) is tapped, so the
    // ledger records exactly which branches actually completed — order among them isn't meaningful (they ran on the
    // SAME input, independent of each other), only WHICH ones succeeded matters. `Effect.tapErrorCause` on the
    // combined effect then compensates whichever branches got that far, if the fan-out as a whole failed (from a
    // typed error OR a defect).
    const anyCompensate = entries.some(([, fn]) => fn.compensate !== undefined);
    const mergeOuts = (outs: readonly unknown[]) => {
      const merged = Object.fromEntries(entries.map(([key], i) => [key, outs[i]])) as { [K in keyof T]: OutOf<T[K]> };
      return opts?.project ? opts.project(merged) : merged;
    };
    const run = (anyCompensate
      ? (ctx: ActionCtx, input: unknown) => {
          const ledger: CompensationLedgerEntry[] = [];
          const tagged = entries.map(([, fn]) =>
            Effect.tap(fn.run(ctx, input as never), () => Effect.sync(() => ledger.push({ fn, input }))));
          // tapErrorCause (not tapError) — same reasoning as sulukFmt's linear compensation path: a branch that
          // DIES (a raw throw/defect) rather than failing with a typed error must still trigger compensation of
          // whichever OTHER branches already succeeded.
          return Effect.tapErrorCause(
            Effect.map(Effect.all(tagged), (outs) => mergeOuts(outs as unknown[])),
            () => compensateReverse(ledger, ctx),
          );
        }
      : (ctx: ActionCtx, input: unknown) =>
          Effect.map(
            Effect.all(entries.map(([, fn]) => fn.run(ctx, input as never))),
            (outs) => mergeOuts(outs as unknown[]),
          )
    ) as AnySulukFn["run"];
    return { [SULUK]: true, slice, run } as SulukFn<unknown, P, ReqOf<T[keyof T]>>;
  }

  /**
   * `sulukFmt.branch` (C106) — real, type-checked CONDITIONAL routing: `discriminator` maps the upstream output to
   * one CASE key, and exactly that ONE case's own fn runs — never a general cross-graph branch executor, just a
   * node choosing which of its OWN declared cases to delegate to (the same narrow-scoping precedent as `recover`'s
   * type-checked, node-own error tags). Every case must share the SAME `Out` (the `Cases` generic bound enforces
   * this: a mismatched case fails to type-check against `SulukFn<A, Out, R>`). `errors`/`steps`/`store.invalidates`
   * UNION across cases (documenting every POSSIBLE path, since only one case runs per call but any could) — but
   * `cost` is the MAX across cases (not the SUM `sulukFmt`/`sulukFmt.all` use), since only one case's cost is ever
   * actually billed. `opts.label` adds a synthetic decision node (its `shape` auto-computes to `"branch"` — it's the
   * SOURCE of a `"branch"` edge into each case); the wire-level `when` on each edge is the case's own KEY (never
   * free-form prose), so it can never independently drift from the real discriminator function.
   *
   *   sulukFmt.branch({ paid: chargeCard, invoice: sendInvoice }, (order) => order.method, { label: "payments.route" })
   */
  export function branch<const Cases extends Record<string, AnySulukFn>>(
    cases: Cases,
    discriminator: (input: InOf<Cases[keyof Cases]>) => keyof Cases,
    opts?: { label?: string; describe?: Partial<Record<keyof Cases, string>> },
  ): SulukFn<InOf<Cases[keyof Cases]>, OutOf<Cases[keyof Cases]>, ReqOf<Cases[keyof Cases]>> {
    const entries = Object.entries(cases) as [string, AnySulukFn][];
    if (entries.length === 0) throw new Error("sulukFmt.branch: needs at least one case.");
    const slice = mergeSlices({}, entries.map(([, fn]) => fn.slice));
    const cost = maxCost(entries.map(([, fn]) => fn.slice.cost));
    if (cost) slice.cost = cost; else delete slice.cost;
    // dedupe/rateLimit: mergeSlices' generic `inherit()` (first-declared-case-wins) is WRONG here — only one case
    // ever actually runs, so a static per-operation facet is only honest when every case that declares one agrees;
    // otherwise the emitted x-suluk-dedupe/x-suluk-ratelimit would enforce an arbitrary, possibly unrelated case's
    // budget against every request regardless of which case is actually selected at runtime.
    const dedupe = agreeOrUndefined(entries.map(([, fn]) => fn.slice.dedupe));
    if (dedupe) slice.dedupe = dedupe; else delete slice.dedupe;
    const rateLimit = agreeOrUndefined(entries.map(([, fn]) => fn.slice.rateLimit));
    if (rateLimit) slice.rateLimit = rateLimit; else delete slice.rateLimit;
    let runGraph = slice.runGraph;
    if (opts?.label) {
      const decision: SulukRunNode = { label: opts.label, kind: "internal" };
      const merged = mergeGraphs([runGraph, finalizeGraph([decision], [])])!;
      const edges = [...merged.edges];
      const describe = opts.describe as Record<string, string> | undefined;
      for (const [key, fn] of entries) {
        const g = fn.slice.runGraph;
        const entry = g ? entryLabels(g)[0] : undefined;
        if (entry !== undefined) {
          const guardDescription = describe?.[key];
          edges.push({ to: entry, after: [opts.label], on: "branch", when: key, ...(guardDescription ? { guardDescription } : {}) });
        }
      }
      runGraph = finalizeGraph(merged.nodes, edges);
    }
    if (runGraph) slice.runGraph = runGraph; else delete slice.runGraph;
    const casesByKey = cases as Record<string, AnySulukFn>;
    const run = ((ctx: ActionCtx, input: unknown) => {
      const key = String(discriminator(input as never));
      const fn = casesByKey[key];
      if (!fn) return Effect.die(new Error(`sulukFmt.branch: discriminator returned unrecognized case "${key}".`));
      return fn.run(ctx, input);
    }) as AnySulukFn["run"];
    return { [SULUK]: true, slice, run } as SulukFn<InOf<Cases[keyof Cases]>, OutOf<Cases[keyof Cases]>, ReqOf<Cases[keyof Cases]>>;
  }

  /**
   * `sulukFmt.race` (C106) — "any" JOIN POLICY: fork every candidate CONCURRENTLY, the first to SUCCEED wins (via
   * {@link raceForSuccess} — Effect has no built-in for this; `Effect.raceAll` races on first SETTLEMENT, not first
   * success). Losers (including ones still in flight) are INTERRUPTED. `errors`/`cost`/`steps`/`store.invalidates`
   * UNION/SUM across ALL candidates (every one of them genuinely runs concurrently, unlike `branch`). Takes a plain
   * ARRAY, not a keyed `Record` (its result is honestly UNKEYED — the winner's own `Out`, not a composite object);
   * `opts.label` adds a synthetic `join:{policy:"any"}` node as the sole terminal — `aggregate:{strategy:"first"}`
   * (the default) or, when `opts.project` (C107) reshapes the winner's own output, `{strategy:"custom"}`.
   * A `compensate` declared on a LOSING candidate does NOT fire if that candidate is interrupted mid-flight — see
   * {@link SulukRunNode.compensate}'s doc comment; this is a deliberate, named boundary, not an oversight.
   */
  export function race<A, Out, R, P = Out>(
    effects: readonly SulukFn<A, Out, R>[],
    opts?: { label?: string; project?: (out: Out) => P; describe?: string },
  ): SulukFn<A, P, R> {
    if (effects.length === 0) throw new Error("sulukFmt.race: needs at least one candidate.");
    const slice = mergeSlices({}, effects.map((fn) => fn.slice));
    if (opts?.project) delete slice.ok; // a projected shape isn't derivable as a schema automatically — same honest gap as sulukFmt.all's.
    // "first" has no per-key mapping to compute (an unordered race has no keys) — aggregateProjection is only ever
    // the author's own `describe` prose, and only when `project` actually reshapes the winner into something else.
    let runGraph = wireJoinNode(slice.runGraph, opts?.label, { policy: "any" }, { strategy: opts?.project ? "custom" : "first" }, opts?.project ? opts.describe : undefined);
    if (runGraph) slice.runGraph = runGraph; else delete slice.runGraph;
    const run = ((ctx: ActionCtx, input: A) => {
      const raced = raceForSuccess(effects.map((fn) => fn.run(ctx, input)));
      return opts?.project ? Effect.map(raced, opts.project) : raced;
    }) as AnySulukFn["run"];
    return { [SULUK]: true, slice, run } as SulukFn<A, P, R>;
  }

  /**
   * `sulukFmt.quorum` (C106) — "quorum" JOIN POLICY: fork every candidate CONCURRENTLY; once `quorum` of them have
   * SUCCEEDED, resolve with an array of those `quorum` results (via {@link raceForQuorum}) and interrupt the rest;
   * fails eagerly the instant quorum becomes unreachable. Same UNION/SUM aggregation rule as {@link race} (every
   * candidate genuinely runs); `Out` becomes `Out[]` (a PARTIAL result — only the winning `quorum`-many candidates'
   * outputs, in completion order; losers are simply absent, never padded/guessed). `opts.label` adds a synthetic
   * `join:{policy:"quorum",quorum}` node as the sole terminal — `aggregate:{strategy:"array"}` (the default) or,
   * when `opts.project` (C107) reshapes the array, `{strategy:"custom"}`.
   */
  export function quorum<A, Out, R, P = Out[]>(
    effects: readonly SulukFn<A, Out, R>[],
    quorumCount: number,
    opts?: { label?: string; project?: (outs: Out[]) => P; describe?: string },
  ): SulukFn<A, P, R> {
    if (effects.length === 0) throw new Error("sulukFmt.quorum: needs at least one candidate.");
    const merged = mergeSlices({}, effects.map((fn) => fn.slice));
    const slice: RequestSlice = { ...merged };
    if (opts?.project) delete slice.ok; else slice.ok = { schema: z.array(merged.ok?.schema ?? z.unknown()) };
    // "array" has no per-key mapping either (a completion-ordered list has no fixed keys) — same rule as `race`.
    let runGraph = wireJoinNode(merged.runGraph, opts?.label, { policy: "quorum", quorum: quorumCount }, { strategy: opts?.project ? "custom" : "array" }, opts?.project ? opts.describe : undefined);
    if (runGraph) slice.runGraph = runGraph; else delete slice.runGraph;
    const run = ((ctx: ActionCtx, input: A) => {
      const raced = raceForQuorum(effects.map((fn) => fn.run(ctx, input)), quorumCount);
      return opts?.project ? Effect.map(raced, opts.project) : raced;
    }) as AnySulukFn["run"];
    return { [SULUK]: true, slice, run } as SulukFn<A, P, R>;
  }

  /**
   * `sulukFmt.recover` (C107) — PIPELINE-WIDE typed error recovery: unlike `sulukFn`'s `node.recover` (scoped to a
   * SINGLE node's own declared errors, type-checked against its own `errors`), this catches a tag raised by ANY
   * step inside an already-composed `pipeline` (a real `sulukFmt`/`sulukFmt.all`/`sulukFmt.branch`/… result) — the
   * general "error routing beyond a single node" the operator asked for, kept on the SAME side of the line as every
   * other C104–C106 primitive: `recoverMap`'s values are REAL, type-checked `SulukFn`s the author writes (each
   * receiving the PIPELINE's own original input, exactly like `compensate`'s "original input" convention), never a
   * data-interpreted predicate/expression language. HONEST LIMITATION: unlike `node.recover`, the tags here are NOT
   * compile-time checked against `pipeline`'s actual bubbled errors — a composed pipeline's precise error union
   * isn't tracked at the type level (only informationally, in `RequestSlice.errors`), so an unrecognized tag simply
   * never fires (harmless, but silent — `@suluk/harden`'s audit can still flag a declared error nothing catches).
   * A recovered tag is REMOVED from the wrapped pipeline's own documented `errors` (it's genuinely handled now);
   * whatever NEW errors a fallback itself can raise are added. Wires one `on:"error"` edge per tag with a labeled
   * fallback, from the pipeline's own ROOTS (the failure can originate at any step inside it) — unconditionally
   * (no `opts.label` gate: unlike `sulukFmt.all`/`race`/`quorum`, there is no synthetic convergence NODE for a
   * label to name, since recovery here has no single decision point the way `sulukFmt.branch` does). The SAME
   * policy is ALSO serialized as a first-class {@link SulukRunGraph.recoverPolicy} list, not just edges.
   *
   *   const checkout = sulukFmt.recover(sulukFmt(fetchCart, charge, ship), { PaymentDeclined: offerRetryLink })
   */
  export function recover<
    Pipeline extends AnySulukFn,
    const RecoverMap extends Record<string, SulukFn<InOf<Pipeline>, OutOf<Pipeline>, ReqOf<Pipeline>>>,
  >(
    pipeline: Pipeline,
    recoverMap: RecoverMap,
  ): SulukFn<InOf<Pipeline>, OutOf<Pipeline>, ReqOf<Pipeline>> {
    const entries = Object.entries(recoverMap) as [string, AnySulukFn][];
    if (entries.length === 0) throw new Error("sulukFmt.recover: needs at least one recover entry.");
    const slice: RequestSlice = { ...pipeline.slice };
    const recoveredTags = new Set(entries.map(([tag]) => tag));
    const remainingErrors = (slice.errors ?? []).filter((e) => !recoveredTags.has(e.errorTag));
    const seenErrorTags = new Set(remainingErrors.map((e) => e.errorTag));
    const fallbackErrors: AnyHttpError[] = [];
    for (const [, fallback] of entries) for (const E of fallback.slice.errors ?? []) if (!seenErrorTags.has(E.errorTag)) { seenErrorTags.add(E.errorTag); fallbackErrors.push(E); }
    const allErrors = [...remainingErrors, ...fallbackErrors];
    if (allErrors.length) slice.errors = allErrors; else delete slice.errors;

    // a fallback's OWN labeled graph ALWAYS unions in (so a reader can see its shape); the recovery edges +
    // recoverPolicy are wired whenever the pipeline itself has a graph with real roots — unconditional, since
    // (unlike sulukFmt.all/race/quorum) there is no synthetic node whose presence a `label` option would gate.
    const pipelineRoots = pipeline.slice.runGraph ? entryLabels(pipeline.slice.runGraph) : [];
    let runGraph = mergeGraphs([pipeline.slice.runGraph, ...entries.map(([, fb]) => fb.slice.runGraph)]);
    if (runGraph && pipelineRoots.length) {
      const edges = [...runGraph.edges];
      const recoverPolicy: { errorTag: string; to: string }[] = [];
      for (const [tag, fallback] of entries) {
        const g = fallback.slice.runGraph;
        const entry = g ? entryLabels(g)[0] : undefined;
        if (entry !== undefined) { edges.push({ to: entry, after: pipelineRoots, on: "error", errorTag: tag }); recoverPolicy.push({ errorTag: tag, to: entry }); }
      }
      runGraph = { ...finalizeGraph(runGraph.nodes, edges), ...(recoverPolicy.length ? { recoverPolicy } : {}) };
    }
    if (runGraph) slice.runGraph = runGraph; else delete slice.runGraph;

    const casesByTag = Object.fromEntries(entries) as Record<string, AnySulukFn>;
    const run = ((ctx: ActionCtx, input: unknown) => {
      const cases: Record<string, (e: AnyHttpErrorInstance) => Effect.Effect<unknown, AnyHttpErrorInstance, unknown>> = {};
      for (const [tag, fallback] of Object.entries(casesByTag)) cases[tag] = () => fallback.run(ctx, input);
      return Effect.catchTags(pipeline.run(ctx, input as never), cases);
    }) as AnySulukFn["run"];
    return { [SULUK]: true, slice, run } as SulukFn<InOf<Pipeline>, OutOf<Pipeline>, ReqOf<Pipeline>>;
  }
}

/** shared by {@link sulukFmt.all}/{@link sulukFmt.race}/{@link sulukFmt.quorum}: when `label` is given, add ONE
 *  synthetic convergence node (carrying the REAL `join`/`aggregate` facts) as the fan-out's SOLE terminal, wired
 *  after every already-merged branch terminal — so a LABELED fan-out gets a defined `resultNode` (an unlabeled one
 *  keeps today's behavior: multiple terminals, no resultNode). No-op (returns `branchesGraph` unchanged) when
 *  `label` is omitted or no branch declared a node at all. */
function wireJoinNode(
  branchesGraph: SulukRunGraph | undefined,
  label: string | undefined,
  join: NonNullable<SulukRunNode["join"]>,
  aggregate: NonNullable<SulukRunNode["aggregate"]>,
  aggregateProjection?: NonNullable<SulukRunNode["aggregateProjection"]>,
): SulukRunGraph | undefined {
  if (!label) return branchesGraph;
  const joinNode: SulukRunNode = { label, kind: "internal", join, aggregate, ...(aggregateProjection ? { aggregateProjection } : {}) };
  const merged = mergeGraphs([branchesGraph, finalizeGraph([joinNode], [])])!;
  const branchTerminals = branchesGraph ? terminalLabels(branchesGraph) : [];
  const edges = [...merged.edges];
  if (branchTerminals.length) edges.push({ to: label, after: branchTerminals });
  return finalizeGraph(merged.nodes, edges);
}

// ── THE HOST + API-REFERENCE BRIDGE ─────────────────────────────────────────────────────────────────────────────────────

export interface SulukRouteSpec<Fn extends AnySulukFn> {
  /**
   * Discharge the function's remaining Effect requirement `R` (its service tag / `Db`) with the per-request env — TYPED to the
   * fn's exact `R`, so a `provide` that discharges too little is a COMPILE error (never a runtime R-leak → 500).
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provide: <A, E>(env: any, program: Effect.Effect<A, E, ReqOf<Fn>>) => Effect.Effect<A, E, never>;
  /** Any explicit override of the bubbled slice (method/path/summary/roles/…). */
  method?: RouteContract["method"];
  path?: string;
  summary?: string;
  name?: string;
  roles?: readonly Role[];
}

/** The Effect requirement a suluk function still needs discharged — used to TYPE `provide`. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ReqOf<Fn> = Fn extends SulukFn<any, any, infer R> ? R : never;

/**
 * Mount a suluk function as a v4 route — project its fully-merged {@link RequestSlice} onto {@link effectRoute} so the HOST
 * (the hono handler) and the API REFERENCE (the derived `DocumentedRoute` → emitV4) come from ONE surface. Everything effectRoute
 * derives — scopes, default cost/rate-limit, the 401 guard + `userId` injection, one typed response per bubbled error, the
 * render — is inherited unchanged; this only supplies the walked ok/request/errors + the synthesized run (read body → run →
 * discharge R → wrap with the view).
 */
export function sulukRoute<Fn extends AnySulukFn>(fn: Fn, spec: SulukRouteSpec<Fn>): EffectRoute {
  const s = fn.slice;
  const method = spec.method ?? s.method;
  const path = spec.path ?? s.path;
  if (!method || !path) {
    throw new Error("sulukRoute: missing method/path — declare them on the outermost sulukFn, or pass them here.");
  }
  const roles = spec.roles ?? s.roles;

  // response: the bubbled DOMAIN schema, WRAPPED by the view (if any) into the wire body. Doc-shape ≡ render-shape (same view).
  const domainSchema = s.ok?.schema;
  const viewed = s.view ? s.view(domainSchema ?? z.unknown()) : undefined;
  const okSchema = (viewed ? viewed.schema : domainSchema) as z.ZodTypeAny | undefined;
  // a body on a no-body-default method (DELETE→204) would be dropped; default it to 200 (an explicit status still wins).
  const okStatus = s.ok?.status ?? (okSchema && NO_BODY_DEFAULT_METHOD[method] ? 200 : undefined);

  // request: body → request.json, query → request.query (path params auto-derive from the path template).
  const request: RouteContract["request"] | undefined =
    s.body || s.query ? { ...(s.body ? { json: s.body } : {}), ...(s.query ? { query: s.query } : {}) } : undefined;

  // cost ← the bubbled SUM + the one worker.request every HTTP call always incurs.
  const cost: RouteContract["cost"] | undefined = s.cost
    ? { ...s.cost, infra: { ...(s.cost.infra ?? {}), "worker.request": 1 } }
    : undefined;
  // rate-limit ← the bubbled tightest budget, keyed by the roles (authed → principal, else ip).
  const authed = (roles ?? []).some((r) => r === "signed-in" || r === "admin");
  const rateLimit: RouteContract["rateLimit"] | undefined = s.rateLimit ? { ...s.rateLimit, key: authed ? "principal" : "ip" } : undefined;
  // scenario ← the bubbled authored steps, with the auth `Given` DERIVED from roles (so journeys needs no toolfactory-stamped
  //            x-suluk-access) prepended + deduped. This is the whole ordered G/W/T the pipeline authored.
  const authGiven: ScenarioStep[] = authed ? [{ role: "given", text: "I am a signed-in user" }] : [];
  const scenario = dedupeSteps([...authGiven, ...(s.steps ?? [])]);
  // store ← the bubbled reactive-STORE facet (a read's `key` / a mutation's `invalidates`), projected onto the contract
  //         (→ x-suluk-store). Pass-through: the facet needs no role-derivation (unlike rateLimit's key).
  const store = s.store;
  // dedupe (C110) ← the bubbled x-suluk-dedupe facet, projected onto the contract. Pass-through, like `store` — no
  // role-derivation, no method-derived default (unlike rateLimit): opt-in only, usually via a drizzle table's
  // `.policy()` (C111).
  const dedupe = s.dedupe;
  // run-graph (C104) ← the bubbled `x-suluk-run` pipeline (every node/edge sulukFmt/sulukFmt.all wired while composing
  //                    this route's whole pipeline), projected onto the contract. Pass-through, like `store`.
  const runGraph = s.runGraph;

  return effectRoute({
    method,
    path,
    ...(spec.name ?? s.name ? { name: spec.name ?? s.name } : {}),
    summary: spec.summary ?? s.summary ?? "",
    ...(s.description !== undefined ? { description: s.description } : {}),
    ...(s.tags !== undefined ? { tags: s.tags } : {}),
    ...(roles !== undefined ? { roles: roles as readonly Role[] } : {}),
    ...(s.scope !== undefined ? { scope: s.scope } : {}),
    ...(s.scopes !== undefined ? { scopes: s.scopes } : {}),
    ...(s.security !== undefined ? { security: s.security } : {}),
    ...(rateLimit !== undefined ? { rateLimit } : {}),
    ...(dedupe !== undefined ? { dedupe } : {}),
    ...(cost !== undefined ? { cost } : {}),
    ...(s.internal !== undefined ? { internal: s.internal } : {}),
    ...(request !== undefined ? { request } : {}),
    ...(scenario.length ? { scenario } : {}),
    ...(store !== undefined ? { store } : {}),
    ...(runGraph !== undefined ? { runGraph } : {}),
    ok: { ...(okSchema ? { schema: okSchema } : {}), ...(okStatus !== undefined ? { status: okStatus } : {}), ...(s.ok?.description ? { description: s.ok.description } : {}) },
    errors: (s.errors ?? []) as unknown as readonly AnyHttpError[],
    // The synthesized handler: build the ctx, read the body once (opt-in typed-400 validation), run the function, discharge its
    // requirement with the real env, and apply the view to shape the wire body.
    run: ((c: Context, auth: { userId?: string }) =>
      Effect.gen(function* () {
        const ctx: ActionCtx = { c, userId: auth.userId ?? "", param: (n) => c.req.param(n) };
        let input: unknown = undefined;
        if (s.body) {
          const raw = (yield* Effect.promise(() => c.req.json().catch(() => ({})))) as unknown;
          if (s.validateBody) {
            const parsed = s.body.safeParse(raw);
            if (!parsed.success) return yield* new ValidationError({ issues: parsed.error.issues.map((i) => i.message) });
            input = parsed.data;
          } else {
            input = raw;
          }
        }
        const program = fn.run(ctx, input as never);
        const domain = yield* spec.provide(c.env, program);
        return viewed ? viewed.value(domain) : domain;
      })) as never,
  });
}
