<p align="center">
  <a href="https://github.com/MahmoodKhalil57/suluk">
    <img src="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/wordmark.png" alt="Suluk" width="360" />
  </a>
</p>

<h1 align="center">@suluk/example-petshop</h1>

<p align="center"><b>The canonical end-to-end demo: Drizzle tables → one builder call → a live validated CRUD server, Scalar docs, a generated shadcn frontend, a metered cost cockpit — all projected from one source.</b></p>

<p align="center">
  <em>Part of <a href="https://github.com/MahmoodKhalil57/suluk">Suluk</a> — one typed OpenAPI v4 contract projecting into every full-stack layer.</em>
</p>

---

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

This is a **private demo package** (not published to npm). It is the reference you read and run to
see how the `@suluk/*` packages compose into a whole stack. Clone the repo and run it locally.

## Run the demo

```sh
cd tooling/ts/packages/example-petshop
bun install
bun run build:frontend   # bundle the generated shadcn UI → dist/client
bun run start            # serve everything on http://localhost:3000
```

Then open:

| Path | What |
| --- | --- |
| `/` | the **generated** shadcn UI (Pet/Category tables + forms), live against the API |
| `/scalar` | Scalar API reference, rendered from the v4 document (shows `x-suluk-cost`) |
| `/openapi.json` | the OpenAPI **v4** document (valid v4, downgrades to valid 3.1) |
| `/superadmin` | the cockpit web panel (gated — send header `x-role: superadmin`) |
| `/cost` | live cost summary: total + per-user / per-operation / per-action / per-source |
| `/pet`, `/category` | the contract-derived, contract-validated CRUD routes |

Other scripts: `bun test` (the corner tests below), `bun run gen:frontend` (re-emit the generated
components to `frontend/components/`), `bun run typecheck`.

## What it shows

One source — two Drizzle tables (`pet`, `category`) — drives the entire stack, with **no hand-wired
glue** between the layers:

- **Data floor.** Real Drizzle tables over `bun:sqlite` are the system of record. `tableToV4(table).insert`
  ([`@suluk/drizzle`](../drizzle)) projects each table to a v4 Schema Object — the builder's entities.
- **Backend.** `buildApp({ entities, info })` ([`@suluk/builder`](../builder)) derives the v4 document and
  the CRUD `RouteContract`s. Real Drizzle handlers are bound to the generated routes and `mount`ed on Hono
  ([`@suluk/hono`](../hono)); request validation comes from the contract.
- **Frontend.** The *same* `buildApp` call emits shadcn `PetTable` / `PetForm` / `CategoryTable` /
  `CategoryForm` components and a page TSX wired to them — real, buildable React (rhf + zod).
- **Docs.** The v4 document is served at `/openapi.json` and rendered by the suluk Scalar fork
  ([`@suluk/scalar`](../scalar)) at `/scalar`.
- **Cost.** Each operation declares a `CostModel`; `annotateCosts` stamps `x-suluk-cost` onto the document
  (so it bubbles to Scalar + the cockpit), and `costMeter` ([`@suluk/cost`](../cost)) attributes every
  request to a user + a frontend action into a `MemoryCostSink`. Displayed as-is at `/cost`.
- **Cockpit.** `adminApp({ document })` ([`@suluk/admin`](../admin)) mounts the `/superadmin` panel —
  the same cockpit as the VS Code extension, including the cost layer.
- **Deploy shape.** `bun:sqlite` *is* SQLite *is* Cloudflare D1; the same `app` deploys to a Worker
  (driver swaps to `drizzle-orm/d1`, static assets become the Worker's `assets` binding).

## When to reach for it

- You want **the canonical "how it all fits" reference** — the one place every Suluk corner (data, backend,
  frontend, docs, cost, cockpit) is wired together against a live backend.
- You're learning a single package and want to see it **in context** with its neighbours.

Not a library — there is nothing to `bun add`. For a real app, read the `@suluk/*` packages this demo
composes ([builder](../builder), [drizzle](../drizzle), [hono](../hono), [scalar](../scalar),
[admin](../admin), [cost](../cost)) and the consumer app `saasuluk`.

## How the source is wired (`src/app.ts`)

```ts
import { Hono } from "hono";
import { mount, type RouteContract } from "@suluk/hono";
import { buildApp } from "@suluk/builder";
import { buildAda, matchRequest } from "@suluk/core";
import { scalarResponse } from "@suluk/scalar";
import { adminApp } from "@suluk/admin";
import { annotateCosts, costMeter, MemoryCostSink, summarize, type CostModel } from "@suluk/cost";
import { entities, tables } from "./entities";       // tableToV4(pet).insert, tableToV4(category).insert
import { drizzleHandlers } from "./store";

// ONE call derives the v4 document, the CRUD routes, AND the frontend components/page.
export const built = buildApp({ entities, info: { title: "Petshop", version: "1.0.0" } });

// Stamp per-operation cost onto the document so it bubbles to Scalar + /superadmin.
export const document = annotateCosts(built.backend.document, costs);

// Bind real Drizzle handlers to the generated routes, meter every request, mount on Hono.
export const app = new Hono();
app.use("*", costMeter({ sink, costs, operationOf: (c) => /* matched via the ADA */ undefined as any, principalOf: (c) => c.req.header("x-user") || "anon" }));
mount(app, /* routes with handlers bound */ built.backend.routes as RouteContract[]);

app.get("/openapi.json", (c) => c.json(document as any));
app.get("/scalar", () => scalarResponse(document));
app.get("/cost", (c) => c.json(summarize(sink.events())));
app.route("/", adminApp({ document, title: "Petshop", authorize: (c) => c.req.header("x-role") === "superadmin" }));
```

`src/app.ts` re-exports `app`, `built`, `document`, `sink`, and `resetDemo()` so the corner tests can
drive the live stack in-process. The runnable entry is `src/main.ts` (static assets + `app.fetch`).

## The corner tests (real usage, in-process)

The tests in `test/` exercise each projected layer against the live `app` — the cleanest worked examples:

```ts
import { app, built, resetDemo } from "../src/app";

// the composition is sound — no contract violations from the builder
expect(built.errors).toEqual([]);

// the document is valid v4 AND downgrades to valid 3.1
import { validateDocument } from "@suluk/core";
import { validate31, downgrade } from "@suluk/openapi-compat";
const doc = await (await app.request("/openapi.json")).json();
expect(validateDocument(doc).valid).toBe(true);
expect(validate31(downgrade(doc).document).valid).toBe(true);

// CRUD round-trips through the contract-VALIDATED routes (a body missing `name` → 400)
expect((await app.request("/pet", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ status: "available" }) })).status).toBe(400);
```

The generated client corner (`test/client.test.ts`) drives the *same* routes through generated
Nano Stores ([`@suluk/nano-stores`](../nano-stores)), and the cost corner (`test/cost.test.ts`)
asserts a write is metered (`createPet` = compute 100 + db-write 30 = 130 µ$) and attributed back to
both the `x-user` principal and the `x-suluk-action` frontend button.

```ts
import { createApiStores } from "@suluk/nano-stores";
const api = createApiStores(built.backend.routes, { baseUrl, fetch });
await api.mutators.createPet.mutate({ data: { name: "Nimbus", status: "available" } }); // contract-validated edge
```

Run them with `bun test`.

## Boundary

The demo is the **wiring**, not new capability — every layer comes from a `@suluk/*` package this app
imports; nothing is reimplemented here. It honours the L3 "render/generate, never host" line: the data
floor is injected (real Drizzle handlers are bound to the generated routes; the bytes/DB stay app-side),
and the cost sink is an injected port (`MemoryCostSink` here; swap for a durable one in production). The
contract is the source of truth — `specification` is a projection of it, end to end (schema → contract →
routes → Drizzle → SQLite/D1). To extend a layer, change the corresponding `@suluk/*` package, not this
demo.

## License

Apache-2.0
