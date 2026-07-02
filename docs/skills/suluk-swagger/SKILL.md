---
description: "Render an OpenAPI v4 'Suluk' document with Swagger UI (via the 3.1 downgrade). CANDIDATE tooling."
name: suluk-swagger
---

# @suluk/swagger

Render an OpenAPI v4 'Suluk' document with Swagger UI (via the 3.1 downgrade). CANDIDATE tooling.

## Quick Start

```ts
import { parseDocument } from "@suluk/core";
import { swaggerHtml, swaggerResponse } from "@suluk/swagger";

const doc = parseDocument(yamlOrJsonText); // an OpenAPIv4Document

// As a self-contained HTML string (+ downgrade diagnostics):
const { html, diagnostics } = swaggerHtml(doc);
for (const d of diagnostics) console.warn(d); // what 3.1 could not represent

// As a Response — drop straight into a Bun.serve / Hono / fetch handler:
app.get("/swagger", () => swaggerResponse(doc));
```

## Configuration

**SwaggerOptions** (4 options — see references/config.md)

## Quick Reference

**Functions:** `swaggerHtml` (Render a v4 document to a self-contained Swagger UI HTML page (+ downgrade diagnostics)), `swaggerResponse` (Convenience for Bun)
**Types:** `RenderResult`

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When defining typed variables or function parameters → read `references/types.md`
- When configuring options → read `references/config.md` for all settings and defaults

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)