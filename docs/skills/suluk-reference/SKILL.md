---
description: "Render an OpenAPI v4 'Suluk' document NATIVELY — as v4, not via the 3.1 downgrade. Shows what a 3.x renderer (Scalar/Swagger) cannot: the 4.0.0-candidate identity, the requests-shape (a path has NAMED requests, incl. multiple sharing one method), and the cost facet (x-suluk-cost) as a first-class per-operation badge. Self-contained server-rendered HTML — no client build, Workers-safe. CANDIDATE tooling."
name: suluk-reference
---

# @suluk/reference

Render an OpenAPI v4 'Suluk' document NATIVELY — as v4, not via the 3.1 downgrade. Shows what a 3.x renderer (Scalar/Swagger) cannot: the 4.0.0-candidate identity, the requests-shape (a path has NAMED requests, incl. multiple sharing one method), and the cost facet (x-suluk-cost) as a first-class per-operation badge. Self-contained server-rendered HTML — no client build, Workers-safe. CANDIDATE tooling.

## Quick Start

```ts
import { referenceHtml, referenceResponse } from "@suluk/reference";
import type { OpenAPIv4Document } from "@suluk/core";

const doc: OpenAPIv4Document = /* your v4 'Suluk' document */;

// As a string (Bun.serve / Astro / anywhere):
const html = referenceHtml(doc, {
  pageTitle: "My API — OpenAPI v4 reference",
  costLedgerUrl: "/cost",        // same-origin URL returning the cost ledger → live declared-vs-actual drift
  whoamiUrl: "/api/whoami",      // same-origin URL returning { viewer: "<id>" } → auto-select that viewer's lens
  tryIt: true,                   // in-page try-it executor (same-origin fetch); default true
});

// Or as a Response (Workers / Hono):
app.get("/reference", () => referenceResponse(doc, { pageTitle: "My API" }));
```

## Configuration

2 configuration interfaces — see references/config.md for details.

## Quick Reference

37 exports (25 functions, 11 types, 1 constants) — see references/ for full API.

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`
- When configuring options → read `references/config.md` for all settings and defaults

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)