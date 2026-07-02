---
description: "Tiered contract-narrowing DSL (components→blocks→sections→pages) bound to the Suluk cycle. A page composes sections; buildApp emits backend (routes+v4) AND frontend (page TSX) at once. Inspired by multivendorbuilder's DSL, rebuilt with the Suluk discipline. CANDIDATE tooling."
name: suluk-builder
---

# @suluk/builder

Tiered contract-narrowing DSL (components→blocks→sections→pages) bound to the Suluk cycle. A page composes sections; buildApp emits backend (routes+v4) AND frontend (page TSX) at once. Inspired by multivendorbuilder's DSL, rebuilt with the Suluk discipline. CANDIDATE tooling.

## Quick Start

```ts
import * as z from "zod";
import { zodToV4 } from "@suluk/zod";
import { buildApp, type Entity } from "@suluk/builder";

// entities as v4 Schema Objects (Zod → v4 is the cycle's standard path)
const Pet: Entity = {
  name: "Pet",
  schema: zodToV4(z.object({
    id: z.number().int().optional(),
    name: z.string().min(1),
    status: z.enum(["available", "sold"]),
  })).schema,
};
const Category: Entity = {
  name: "Category",
  schema: zodToV4(z.object({ id: z.number().int().optional(), name: z.string() })).schema,
};

const app = buildApp({ entities: [Pet, Category], info: { title: "Shop", version: "1.0.0" } });

app.backend.routes;          // 10 RouteContracts (5 CRUD × 2 entities): listPet, createPet, …
app.backend.document;        // a valid OpenAPI v4 document emitted from those routes
app.frontend.components;     // [{ name: "PetForm", tsx }, { name: "PetTable", tsx }, …]
app.frontend.pages;          // [{ name: "App", tsx }] — page composing every entity's CRUD section
app.errors;                  // DslError[] — empty ⇒ the composition is contract-sound
```

## Quick Reference

97 exports (44 functions, 40 types, 13 constants) — see references/ for full API.

## References

Load these on demand — do NOT read all at once:

- When calling any function → browse `references/functions/` for grouped indexes, full signatures, parameters, and return types
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)