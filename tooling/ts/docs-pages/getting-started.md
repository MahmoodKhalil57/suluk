---
title: Getting Started
---

# Get started

Suluk turns **one source of truth** — your data schema + your routes — into the whole stack. You write
the contract once; the docs, the typed client, the UI, the validation, the tests, and the admin panel are all
*derived* from it, so they cannot drift.

## The 30-second tour

```ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { tableToV4 } from "@suluk/drizzle";
import { buildApp } from "@suluk/builder";

// 1. your data is the system of record (Drizzle — and sqlite-core IS Cloudflare D1)
const pet = sqliteTable("pet", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  status: text("status", { enum: ["available", "pending", "sold"] }).notNull().default("available"),
});

// 2. one call derives BOTH ends
const app = buildApp({ entities: [{ name: "Pet", schema: tableToV4(pet).insert }] });

app.backend.document;     // → the OpenAPI v4 document (validated)
app.backend.routes;       // → Hono CRUD RouteContracts (mount them)
app.frontend.components;  // → shadcn Form + Table (TSX)
app.frontend.pages;       // → page TSX wired to the typed client
```

From that one document you get **Scalar/Swagger docs**, a typed **Nano Stores** client, generated **shadcn**
UI, **contract tests**, a documentation **audit**, the **/superadmin** admin panel, and a **Cloudflare**
deploy plan. See the [runnable demo](https://github.com/MahmoodKhalil57/suluk/tree/main/tooling/ts/packages/example-petshop) —
it boots the entire stack from one schema.

## Install

Everything is a small focused package — add only what you need:

```sh
bun add @suluk/core @suluk/hono @suluk/zod
```

Browse every package in the sidebar under **Modules**, and read [how it fits together](architecture.md).

## The platform generator

For a whole SaaS backend, one manifest compiles to a wired Hono app + a Cloudflare provisioning plan:

```ts
import { definePlatform } from "@suluk/platform";

export default definePlatform({
  services: ["auth", "credits", "keys", "billing", "cost", "logs"],
});
```

`@suluk/platform` plans the `shadcn add` list, the wired `src/index.ts`, and the merged `provision.config.ts`
from that single declaration — see the `@suluk/platform` and `@suluk/provision` entries under **Modules**.

> Suluk is a **candidate** exploration of OpenAPI v4 "Moonwalk" — not the official specification.
