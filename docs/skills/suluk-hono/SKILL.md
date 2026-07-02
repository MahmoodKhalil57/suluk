---
description: "The Suluk derivation engine: minimal Hono+Zod RouteContracts in; v4 doc (dynamic per principal+time), validation, contract tests, and doc-coverage audit out. CANDIDATE tooling."
name: suluk-hono
---

# @suluk/hono

The Suluk derivation engine: minimal Hono+Zod RouteContracts in; v4 doc (dynamic per principal+time), validation, contract tests, and doc-coverage audit out. CANDIDATE tooling.

## Quick Start

```ts
import * as z from "zod";
import { contract, emitV4 } from "@suluk/hono";

const Pet = z.object({ id: z.number().int().optional(), name: z.string().min(1), tags: z.array(z.string()) });

const routes = contract([
  {
    method: "get", path: "/pet", name: "listPets",
    summary: "List pets", tags: ["pets"],
    responses: [{ status: 200, description: "ok", schema: z.array(Pet) }],
  },
  {
    method: "post", path: "/pet", name: "createPet",
    summary: "Create a pet", scopes: ["write:pets"],
    request: { json: Pet, examples: [{ name: "Rex", tags: [] }] },
    responses: [{ status: 201, description: "created", schema: Pet }],
  },
  {
    method: "get", path: "/pet/:petId", name: "getPet",
    summary: "Get a pet by id",
    request: { params: z.object({ petId: z.string() }) },
    responses: [{ status: 200, description: "ok", schema: Pet }],
  },
]);

const { document, diagnostics } = emitV4(routes, { info: { title: "Pets", version: "1.0.0" } });
// `document` is a v4 (4.0.0-candidate) OpenAPIv4Document — Hono ":petId" became uriTemplate "pet/{petId}".
```

## Configuration

5 configuration interfaces — see references/config.md for details.

## Quick Reference

45 exports (18 functions, 2 classes, 23 types, 2 constants) — see references/ for full API.

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When using a class → read `references/classes.md` for properties, methods, and inheritance
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`
- When configuring options → read `references/config.md` for all settings and defaults

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)