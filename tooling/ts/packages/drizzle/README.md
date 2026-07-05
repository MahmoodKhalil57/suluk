<p align="center">
  <a href="https://github.com/MahmoodKhalil57/suluk">
    <img src="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/wordmark.png" alt="Suluk" width="360" />
  </a>
</p>

# @suluk/drizzle

**The DATA floor of the Suluk cycle — your Drizzle ORM schema becomes the v4 contract, the CRUD routes, and the dev DDL, with nothing hand-mirrored.**

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```sh
bun add @suluk/drizzle
```

Peers (you already have these in a Suluk app): `drizzle-orm`, `drizzle-zod`, `zod` (v4), `hono`.

## What it does

A Drizzle table is the system of record; this package projects it — losslessly and honestly — into the rest of the stack:

- **Table → v4 Schema Objects.** `table → drizzle-zod (select/insert/update Zod) → @suluk/zod zodToV4 → v4 Schema Objects`. drizzle-zod already encodes the DB's truth (required = notNull-and-no-default, optional PKs/defaults, nullable columns); we only compose and lift it.
- **Generated CRUD route contracts.** The five conventional REST operations as `@suluk/hono` `RouteContract`s — derivable into a v4 document with **no running server**.
- **A driver-agnostic, gated CRUD handler factory.** ONE implementation that serves dev (`bun:sqlite`, sync) and a Worker (D1, async); the db is injected as a resolver, so there is no twin to drift.
- **A SQLite DDL generator.** Build the in-memory dev schema *from* the Drizzle tables — no hand-mirrored `CREATE TABLE` string to drift.
- **Once-only write primitives.** Race-safe compare-and-set for money / state-machine paths, normalized across driver result shapes.
- **Atomic batch writes + a query cache, cost-consciously.** `atomicBatch` wraps `db.batch()` (the cross-driver-safe multi-statement primitive — D1 and dev alike); `guardTransactions` disables `db.transaction()` (broken on real D1, silently "works" against the local dev shim); `SulukCache` is an opt-in, `strategy:"explicit"` query cache backed by Cloudflare's free `caches.default` in prod / an in-memory Map in dev — no Upstash, no new provisioning.
- **The honest metadata floor.** Column descriptors read straight off the table (nullability, defaults, PK/autoincrement, enums) — nothing inferred. Losses are never silent: the v4 lift surfaces `zodToV4` warnings and component-name collisions.

## When to reach for it

Reach for `@suluk/drizzle` when **your data model is Drizzle** — it is the on-ramp for any DB-backed Suluk app. Define a table once and it flows into the contract, the SDK, the admin panel, and the conformance suite.

- Use `tableComponents` / `tableToV4` to put your tables into a v4 document's `components.schemas`.
- Use `crudRoutes` to emit the five REST operations as contracts (the `@suluk/hono` shape).
- Use `crudHandlers` for the actual gated runtime handlers (one factory, dev + Worker).
- Use `schemaDDL` to build the dev DB from the same tables.
- Use `claimOnce` / `claimRows` for transitions that must fire exactly once.

If you're *defining routes* rather than deriving them from a DB, that's `@suluk/hono` (which this package builds on for the access gate). If you only need Zod ⇄ v4 conversion, that's `@suluk/zod`.

## Usage

### Table → v4 Schema Objects

```ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { tableComponents, tableToV4 } from "@suluk/drizzle";

const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull(),                       // required on insert
  name: text("name"),                                    // nullable
  role: text("role", { enum: ["admin", "user"] }).notNull().default("user"),
});

// The three projections of one table.
const { select, insert, update } = tableToV4(users);
//   select → all columns required;  insert → only `email` required;  update → nothing required (PATCH body)

// A components.schemas record, keyed by PascalCase table name (C009 by-name).
const schemas = tableComponents([users]); // → { Users: <select v4 Schema> }
```

Need the honest loss accounting? `tableToV4Warnings(users)` returns `{ schemas, warnings }`, and
`tableComponentsAudit(tables)` returns `{ schemas, collisions }` — both enumerate what was dropped or
collided rather than swallowing it. (drizzle-zod schemas are plain objects, so the lift is usually lossless.)

### Generate CRUD route contracts → a v4 document

```ts
import { crudRoutes } from "@suluk/drizzle";
import { emitV4 } from "@suluk/hono";

// list / get / create / update / delete — named listUsers/getUsers/createUsers/updateUsers/deleteUsers.
const routes = crudRoutes(users);
//   GET    /users          → 200 array(select)        (+ page/perPage/sort/order/q query params)
//   GET    /users/:id      → 200 select, 404
//   POST   /users          (json insert) → 201 select
//   PATCH  /users/:id      (json update) → 200 select, 404
//   DELETE /users/:id      → 204

// Closes the floor-to-contract chain: a structurally valid v4 document, no server running.
const { document } = emitV4(routes);

// Options: scope the path, the id param, list query, and delete policy.
crudRoutes(users, {
  basePath: "/v1/people",
  idParam: "userId",
  softDelete: true,                                  // DELETE sets deletedAt and returns the row (200, not 204)
  anonymizeDelete: { columns: ["email", "name"] },   // GDPR keep-record redaction on delete
});
```

### Driver-agnostic gated CRUD handlers (dev + Worker, one factory)

The db is injected as a resolver, so the same factory serves a synchronous `bun:sqlite` dev server and an
async D1 Worker. Access modes come from `@suluk/hono`'s gate (`owned` / `public` / `admin` / …); owner-scoping,
private-column redaction, and post-update hooks are wired through options.

```ts
import { Hono, type Context } from "hono";
import { crudHandlers, type CrudDb } from "@suluk/drizzle";

const h = crudHandlers(users, {
  access: "owned",
  ownerCol: "ownerId",
  db: (c) => myDrizzleDb as unknown as CrudDb,   // dev: () => db;  worker: (c) => drizzle(c.env.DB)
  principal: (c: Context) => c.req.header("x-user") ?? null, // the verified caller id
  isAdmin: (c: Context) => c.req.header("x-admin") === "1",
  redact: (table, row, admin) => admin ? row : stripSecret(row), // optional private-column redaction
});

const app = new Hono();
app.get("/users", h.list);
app.get("/users/:id", h.get);
app.post("/users", h.create);     // create STAMPS the owner from `principal`, ignoring any body value
app.patch("/users/:id", h.update);
app.delete("/users/:id", h.delete);
```

`h.list` reads `page/perPage/sort/order/q` and per-column equality filters via `parseListQuery` (which only
honors *real* columns — unknown keys are dropped, so a filter can never widen past the owner scope). Pagination
is opt-in: the full list unless `page`/`perPage` is passed.

### SQLite DDL — build the dev DB from the tables

```ts
import { Database } from "bun:sqlite";
import { schemaDDL, tableDDL } from "@suluk/drizzle";

const db = new Database(":memory:");
db.exec(schemaDDL([users, orders]));   // CREATE TABLE … for every table, newline-joined
//  identifiers are quoted (reserved words like `order` are safe); booleans → INTEGER, enums → TEXT,
//  static defaults emitted, autoincrement PKs honored.  Prod migrations stay the source of truth for prod.

tableDDL(users, { ifNotExists: false }); // one table; drop the IF NOT EXISTS guard
```

### Once-only writes (compare-and-set for money / state machines)

The `where` MUST carry the FROM-state guard, so a re-delivery or concurrent caller finds the row already
transitioned and changes nothing. The state machine and side-effects stay in your app; this owns only the
race-safe claim, behind a port.

```ts
import { and, eq } from "drizzle-orm";
import { claimOnce, claimRows, rowsChanged, type ClaimDb } from "@suluk/drizzle";

// Fire a side-effect (charge, decrement, email) exactly once iff THIS call won the transition.
const won = await claimOnce(
  db as unknown as ClaimDb,
  orders,
  and(eq(orders.id, id), eq(orders.status, "pending"))!, // FROM-state guard
  { status: "paid" },
);
if (won) await chargeCustomer(id); // the re-delivery's claim returns false → no double-charge

// Claim a SET of rows and act only on the ones this call won (disjoint across concurrent sweeps).
const claimed = await claimRows(db as unknown as ClaimDb, waitlist, eq(waitlist.notified, false), { notified: true });
for (const row of claimed) await notify(row);

// Normalize the affected-row count across drivers (.changes / .meta.changes / .rowsAffected).
rowsChanged(await db.update(orders).set({ status: "shipped" }).where(eq(orders.id, id)).run());
```

### Atomic batch writes, disabling `db.transaction()`, and an opt-in query cache

`db.transaction()` is NOT safe on Cloudflare D1 in production: drizzle's D1 driver sends `BEGIN`/`COMMIT` as
separate `.run()` calls, but D1 is a stateless HTTP surface with no session tying them together — it throws at
runtime ("use `state.storage.transaction()`..."). Worse, a local dev shim over `bun:sqlite` (a real, persistent
connection) makes `db.transaction()` silently *appear* to work until you deploy. `guardTransactions` closes that
trap the same way everywhere; `atomicBatch` is the actual cross-driver-safe replacement — every statement known
up front, one round trip, genuinely all-or-nothing on D1, libSQL, and the dev shim alike.

```ts
import { drizzle } from "drizzle-orm/d1";
import { atomicBatch, guardTransactions, SulukCache, memoryCacheBackend, cloudflareCacheBackend } from "@suluk/drizzle";

const db = guardTransactions(drizzle(env.DB, { cache: new SulukCache(cloudflareCacheBackend(caches.default)) }));

// Several statements, atomically, in ONE round trip — no reading an intermediate result mid-way.
await atomicBatch(db, [
  db.insert(orders).values({ id, total }),
  db.update(inventory).set({ qty: sql`qty - 1` }).where(eq(inventory.sku, sku)),
]);

// A conditional read-then-write still goes through claimOnce/claimRows (a single UPDATE...RETURNING is
// already atomic on its own — no batch, no transaction needed).

db.transaction(async (tx) => { /* ... */ }); // throws immediately, in dev too — use atomicBatch or claimOnce instead

// Opt ONE query into caching (never a default — strategy is always "explicit"); entries expire via TTL only
// (never actively invalidated on write, which would cost an extra lookup on every mutation).
await db.select().from(products).$withCache();
```

## API

| Export | What it does |
| --- | --- |
| `tableMetadata(table)` | Honest column descriptor floor: `{ name, primaryKey, unique, columns }` (nullability, defaults, PK, enums). |
| `tableComponentName(table)` / `pascalCase(s)` | The v4 component key derived from the SQL name (C009 by-name). |
| `tableSchemas(table)` | The three Zod projections: `{ select, insert, update }` (update = `insert.partial()`). |
| `tableToV4(table)` | The same three lifted to v4 Schema Objects. |
| `tableToV4Warnings(table)` | `{ schemas, warnings }` — the per-projection `zodToV4` loss accounting. |
| `tableComponents(tables)` | `{ [PascalName]: select-v4-schema }` for `components.schemas`. |
| `tableComponentsAudit(tables)` | `{ schemas, collisions }` — enumerates name collisions instead of dropping them. |
| `crudRoutes(table, opts?)` | The five conventional CRUD `RouteContract`s (the `@suluk/hono` shape). |
| `listQuerySchema(table?, opts?)` / `parseListQuery(raw, table, opts?)` | Declare `page/perPage/sort/order/q` params, and the pure parser the handler uses. |
| `crudHandlers(table, opts)` | Driver-agnostic gated CRUD handler factory (dev `bun:sqlite` + Worker D1, one impl). |
| `softDeleteValues` / `anonymizeValues` / `touchTimestamps` / `notSoftDeleted` | The PATCH value-builders your handler applies for soft-delete / GDPR-anonymize / timestamps. |
| `tableDDL(table, opts?)` / `schemaDDL(tables, opts?)` | SQLite `CREATE TABLE` DDL generated from the tables. |
| `claimOnce` / `claimRows` / `rowsChanged` | Once-only compare-and-set write primitives, normalized across drivers. |
| `atomicBatch(db, statements)` | Runs 2+ built statements in ONE atomic `db.batch()` round trip (D1 + dev shim + libSQL). |
| `guardTransactions(db)` | Disables `db.transaction()` (throws immediately, everywhere) — broken on real D1. |
| `SulukCache` / `memoryCacheBackend()` / `cloudflareCacheBackend(cache)` | Opt-in (`strategy:"explicit"`) query cache — free Cache API in prod, in-memory Map in dev; TTL-only, no active invalidation. |

## Boundary

This package projects **contracts** and supplies **mechanism** — it runs no SQL of its own. The db is an
injected port: you hand `crudHandlers` / `claimOnce` a resolver (`() => db` in dev, `(c) => drizzle(c.env.DB)`
in a Worker), and the package never owns a connection. The CRUD/CAS skeleton is generic; the order/money
*machine* — which transitions exist, which side-effects fire, the policy of which column is `deletedAt` or which
columns to redact — stays app-side. Prod migrations remain the source of truth for prod; `schemaDDL` is the
dev-schema twin only. New driver-agnostic query mechanics belong here (keep terminals explicitly awaited for D1
parity); the N=1 policy does not.

## License

Apache-2.0
