# @suluk/sdk

**Generate a complete, intuitive TypeScript SDK from one v4 "Suluk" contract — ofetch-based, entity-grouped, fully typed, auth wired, with the v4 superpowers (declared cost + access + input schema) surfaced as typed metadata on every method.**

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```sh
bun add @suluk/sdk
```

`ofetch` and `@cfworker/json-schema` are peer dependencies — bring your own. The **generated** SDK
imports both at runtime, so an app that ships the output needs `bun add ofetch @cfworker/json-schema`.

## What it does

`generateSdk(doc)` takes a v4 document and returns **one self-contained `.ts` file** (a string) — a
client library a developer downloads and uses straight away, not a bag of functions:

- **`ofetch`-based `createClient(config)` factory** — auth wired via an `onRequest` interceptor (bearer
  token or session cookie), retries, configurable `baseURL`.
- **Entity-grouped methods** — CRUD operations group by entity (`api.product.create(...)`), custom ops
  by path (`api.checkout.order(...)`). Method-name collisions are resolved deterministically and surfaced.
- **Fully typed from the schemas** — request bodies, query params, and response types are TS types
  derived from the contract's JSON Schemas (the same `tsType` mapping is exported for reuse).
- **Inputs shipped AS DATA + validated directly** — the contract's input JSON Schemas (2020-12) are
  emitted as a literal `schemas` map and validated by a generic, eval-free engine (`@cfworker/json-schema`,
  Workers-native) — never transpiled into one validator's source, so what runs is exactly what the
  contract stores. Each input is exposed as a **Standard Schema** (`.input`), so it drops into
  react-hook-form / TanStack Form / tRPC unchanged.
- **v4 facets as typed metadata** — every method carries `.cost` (µ$), `.requires` (access), and `.input`
  (the Standard Schema), plus a client-level `$manifest` / `$meta` for tooling. These are hints + a
  client-side guard, **not** enforcement — the server stays the security boundary.

## When to reach for it

- You want to hand API **consumers** a typed client library generated from the contract — e.g. expose a
  `GET /sdk.ts` route that streams the generated source as a download.
- You want the client to validate inputs against the contract's real constraints before sending, and to
  carry cost/access metadata for cost-aware or permission-aware UIs.

**Not** for an admin UI (use `@suluk/panel` / `@suluk/admin`), rendered API reference docs
(`@suluk/reference` / `@suluk/scalar`), or owned React form/table components (`@suluk/shadcn`). And it
generates source the consumer **owns** — it does not host a client runtime they have to call home to.

## Usage

`generateSdk` is codegen: feed it a v4 document, get back TypeScript source as a string. Common case —
serve it as a downloadable file from your API (this is exactly how `saasuluk` exposes its SDK):

```ts
import { generateSdk } from "@suluk/sdk";
import type { OpenAPIv4Document } from "@suluk/core";

// `document` is your v4 contract (e.g. projected by @suluk/hono / @suluk/drizzle)
app.get("/sdk.ts", (c) =>
  new Response(generateSdk(document, { baseURL: new URL(c.req.url).origin }), {
    headers: {
      "content-type": "application/typescript; charset=utf-8",
      "content-disposition": 'attachment; filename="my-sdk.ts"',
    },
  }),
);
```

Or write it to disk in a build step:

```ts
import { generateSdk } from "@suluk/sdk";

const source = generateSdk(v4Document, { baseURL: "https://api.example.com" });
await Bun.write("./client/suluk-sdk.ts", source);
```

### Using the generated SDK

The emitted file exports `createClient`. A consumer drops it in alongside `ofetch` +
`@cfworker/json-schema`:

```ts
import { createClient } from "./suluk-sdk";

const api = createClient({
  baseURL: "https://api.example.com",
  token: () => localStorage.getItem("token"), // string | sync/async getter → `Authorization: Bearer …`
  // credentials: "include"  // session-cookie auth (default)
  // validate: false         // skip client-side input validation (default: on)
});

// entity-grouped: CRUD by entity, custom ops by path
const products = await api.product.list();
const order = await api.checkout.order({ items: [{ productId: 1, qty: 2 }] }); // input validated before send

// v4 facets ride along as typed metadata on each method
api.product.create.cost;      // declared cost in µ$  (number | null)
api.product.create.requires;  // who can call it      ("anyone" | "admin" | …)
api.product.create.input;     // the Standard Schema   (plugs into react-hook-form / TanStack Form / tRPC)

// client-level escape hatches + introspection
api.$fetch;     // the raw ofetch instance
api.$schemas;   // the contract's input JSON Schemas, as data
api.$manifest;  // { "<entity.method>": { cost, requires, scope? } }
api.$meta;      // { operations, totalDeclaredMicroUsd, version }
```

The generated SDK also exports the shared models from `components.schemas` (a TS `type` + a `…Schema`
Standard Schema per model, both derived from the one JSON Schema), `SulukValidationError` (thrown when an
input fails validation), and the `schemas` data map.

### `tsType` — the schema → TS-type mapping

The same JSON-Schema → TS-type-string function the generator uses internally is exported, in case you
need it standalone (e.g. building adjacent codegen):

```ts
import { tsType } from "@suluk/sdk";

tsType(doc, { type: "string" });                                  // "string"
tsType(doc, { type: "array", items: { type: "integer" } });       // "number[]"
tsType(doc, { type: "object", properties: { a: { type: "string" } }, required: ["a"] }); // "{ a: string }"
```

## API

| Export | What it does |
| --- | --- |
| `generateSdk(doc, opts?)` | Takes an `OpenAPIv4Document`, returns a complete self-contained SDK as a TypeScript source string. |
| `tsType(doc, schema, depth?)` | Maps a JSON Schema to a TypeScript type string (used for typed inputs/responses). |
| `SdkOptions` | Options type for `generateSdk` — `{ baseURL?: string }`. |

## Boundary

This is **codegen** (L3: render/generate, never host) — `generateSdk` returns a string of source the
consumer owns and can edit; nothing here becomes a runtime they must call home to. The package does **not**
fetch your contract, host a client, or enforce the facets: `.cost` / `.requires` are inert metadata + a
client-side guard, and the **server is the security boundary** (per ADR C022). You inject the v4 document
(projected by `@suluk/hono` / `@suluk/drizzle` / your own source) and the `baseURL`; serving the generated
file and authenticating real requests stay app-side.

## License

Apache-2.0
