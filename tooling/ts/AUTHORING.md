# Authoring a Suluk app — the mental model

> The one page to read before you write a route. It fits in your head: **one unit, two ways to compose it, one
> projection.** Everything else — the OpenAPI doc, the tests, the SDK, the cost table, the event catalog — is *derived*.
> You never hand-write any of it. (For the *why* behind the derivation thesis, see [`ARCHITECTURE.md`](../ARCHITECTURE.md).)

## The one idea

**Contracts in, everything derived.** You write typed handlers over your database schema. The v4 OpenAPI document is a
*projection* of those handlers, never a thing you edit — and once you have that document, every other artifact
(request validation, contract tests, the reactive SDK, the cost model, the Gherkin/Bruno journeys, the AsyncAPI event
catalog) is another pure projection of it. Declare a fact **once**, at the layer that owns it; it bubbles everywhere.

## The whole vocabulary

You compose these. There is nothing else to learn — the list is deliberately short (it used to be 3× longer; see
*What was removed* below).

| You write | It is | From |
| --- | --- | --- |
| **`sulukFn({ … })`** | the ONE composable unit — a typed `run` + a *slice* of the v4 `Request` (method/path/body/errors/cost/…) it contributes | `@suluk/effect` |
| **`sulukFmt(a, b, …)`** | run+format a **linear pipeline** — thread the runs, MERGE the slices (a service `sulukFmt`s its models; a route `sulukFmt`s its services) | `@suluk/effect` |
| **`sulukFmt.all({ k: fn })`** | **fan-out** — run branches on the *same* input → a derived `{ k }` body; errors UNION, cost SUM | `@suluk/effect` |
| **`sulukRoute(fn, { provide })`** | the ONE projection — turn a fully-composed `sulukFn` into `{ contract, handler }` (the api reference + the Hono handler) | `@suluk/effect` |
| **`view("todo")` / `listView("todos")`** | a pending response wrap — bound to the model's schema at the route boundary (`{ todo }` / `{ todos: [...] }`) | `@suluk/effect` |
| **`queryOne` / `queryMany` / `mutate`** | a MODEL from ONE drizzle query — the response schema is DERIVED from the query's projection; the same query runs per-request | your `app.ts` |
| **`routeGroup("/api/todos")`** | the module ENVELOPE — `.route(...)` as you go; `.ops` → the contract fragment, `.router()` → the mount | `@suluk/hono` |
| **`table.zodSchema` + `.zod(refine)`** | the SCHEMA SEAM — a column's wire refinement lives WITH its DDL; `pick`/`omit` it for request bodies | `@suluk/drizzle` |
| **`NotFoundError(...)` etc.** | typed HTTP errors (status + body schema) — each becomes a distinct typed response, never a generic `ProblemDetails` | `@suluk/effect` |

Plus one direct primitive for one-off routes: **`effectRoute({ … })`** — a single handler → a single route. `sulukRoute`
projects onto it internally; reach for it directly only when a route has no model/service layering to compose.

## The shape of a feature: model → service → route

Every layer is a `sulukFn`. Facts live on the **leaf** (the model) and bubble UP, so services and routes restate nothing.

```
models   findTodo   = queryOne({ cost: readCost, query: (db,ctx,id) => db.select()…, orElse: () => new NotFoundError(…) })
             │  ok.schema  ← the query's projected columns (their .zod() refinements)   — no hand-written DTO
             │  404        ← the orElse factory's class                                  — no `errors: [...]`
             │  cost        DEFINED here                                                  — bubbles up as a SUM
             ▼
services getTodo    = sulukFmt(findTodo)                        // formats the model; inherits schema+404+cost
             ▼
routes   getTodo    = sulukFmt(
             controller = sulukFn({ method:"get", path:"/api/todos/:id", roles:["signed-in"], view:view("todo"),
                                    run:(ctx)=>Effect.succeed(ctx.param("id")!) }),   // extracts the input; owns the HTTP identity
             getTodoService )                                    // everything else BUBBLES: response schema, 404, cost, rate-limit
         todos.route(sulukRoute(getTodo, { provide }))           // → contract + handler
```

`roles: ["signed-in"]` alone derives the scope, the cost's rate-limit settlement, the 401, and the auth guard (C078). The
controller declares only what is *its* — the HTTP identity and how to pull the service's input off the request.

## What bubbles — declare each fact once

Composition (`sulukFmt` / `sulukFmt.all`) merges the slices with these laws, so the fact you write on one leaf is the fact
the whole route reports:

| Fact | Declared on | Merges by |
| --- | --- | --- |
| response schema | the model (derived from its query, or `view`+model) | inherited up the pipeline |
| typed errors | the model's `orElse` (or a leaf's `errors`) | **UNION** |
| cost | the model (`{ infra: { "d1.read": 1 } }`) | **SUM** (the CostModel monoid) |
| rate-limit | any leaf | **tightest** (most restrictive wins) |
| request body | the model's `input` (`todo.zodSchema.pick({ title:true })`) | inherited up to the route |
| BDD `step` | any layer (`{ role:"given", text:"a todo the caller owns exists" }`) | concat + dedup |

## What you get for free — all standard, nothing bespoke on the wire

| Surface | Standard | Emitter |
| --- | --- | --- |
| the API (requests/responses) | **OpenAPI v4** + **JSON Schema 2020-12** | `emitV4` (`@suluk/hono`) |
| every error body | **RFC 9457** `application/problem+json` | derived from the error classes |
| runnable acceptance tests | **Gherkin** `.feature` → bun:test, **Bruno**, **Postman** | `@suluk/journeys` (reads the `step`s) |
| the event surface (jobs, webhooks, store invalidations) | **AsyncAPI 3.0** + **CloudEvents 1.0.2** | `emitAsyncApi` (`@suluk/hono`), typed by `@suluk/core` (`CloudEventV1`/`AsyncApiDocument`, C100) |

The BDD `step`s you write on your services/controllers are the Given/When/Then of the generated scenarios — the same
sentences document the code and *run* as tests. (An event surface only appears on the AsyncAPI projection once a module
declares jobs/webhooks/`x-suluk-store` — the projection is ready, adoption is per-module.)

## What was removed (so you don't go looking for it)

The C080 **service-action / pipeline** layer — `action` / `op` / `pipeline` / `chain` / `seq` / `all` / `branch` /
`effectPipeRoute` / `fixedEnvelope` — was superseded by `sulukFn`/`sulukFmt` and **deleted in C100**. If you meet it in
old code or a blog draft, translate:

| Old (removed) | New |
| --- | --- |
| `action({ … })` / `op({ … })` | `sulukFn({ … })` |
| `pipeline(a, b)` / `chain` / `seq` | `sulukFmt(a, b)` |
| `all({ todo, count })` | `sulukFmt.all({ todo, count })` |
| `effectPipeRoute({ pipeline })` | `sulukRoute(fn, { provide })` |
| `envelope("todo", S)` / `listEnvelope` | `view("todo")` / `listView("todos")` (bound at the route) |
