---
description: "Generate a COMPLETE, intuitive TypeScript SDK from a v4 'Suluk' contract — built on ofetch, entity-grouped, fully typed from the schemas, auth wired (bearer/session) via interceptors, and the v4 superpowers (declared cost + access) surfaced as typed metadata. Not a bag of functions: a library a developer downloads and uses straight away. CANDIDATE tooling."
name: suluk-sdk
---

# @suluk/sdk

Generate a COMPLETE, intuitive TypeScript SDK from a v4 'Suluk' contract — built on ofetch, entity-grouped, fully typed from the schemas, auth wired (bearer/session) via interceptors, and the v4 superpowers (declared cost + access) surfaced as typed metadata. Not a bag of functions: a library a developer downloads and uses straight away. CANDIDATE tooling.

## Quick Start

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

## Configuration

2 configuration interfaces — see references/config.md for details.

## Quick Reference

**generate:** `generateSdk` (`@suluk/sdk` — generate a complete, intuitive TypeScript SDK from a v4 "Suluk" contract), `tsType` (A JSON schema → a TS type string (used for typed method inputs + response types)), `resolveOps` (walkOps + DETERMINISTIC method-name collision resolution — SHARED by generateSdk AND generateStores so the client
accessor names (`client), `clientAccessor` (The client accessor for an op — the dotted path AFTER `client), `OpInfo` (`@suluk/sdk` — generate a complete, intuitive TypeScript SDK from a v4 "Suluk" contract)
**generate-stores:** `generateStores` (generateStores(doc) — project the C037 reactive facet (`x-suluk-store` + `x-suluk-notify`) into a typed Nano Stores
reactive layer (states + mutation→store invalidation + a hookable callback seam) on top of the generated client)

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When defining typed variables or function parameters → read `references/types.md`
- When configuring options → read `references/config.md` for all settings and defaults

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)