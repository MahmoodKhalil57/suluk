---
description: "Lossless-where-possible conversion between the OpenAPI v4 'Suluk' candidate and OpenAPI 3.1 (the dialect Scalar/Swagger consume). CANDIDATE tooling."
name: suluk-openapi-compat
---

# @suluk/openapi-compat

Lossless-where-possible conversion between the OpenAPI v4 'Suluk' candidate and OpenAPI 3.1 (the dialect Scalar/Swagger consume). CANDIDATE tooling.

## Quick Start

```ts
import { downgrade, validate31 } from "@suluk/openapi-compat";
import { parseDocument } from "@suluk/core";

const v4 = parseDocument(yamlOrJsonText);          // an OpenAPIv4Document
const { document, diagnostics } = downgrade(v4);   // document is OpenAPI 3.1

// Anything 3.1 couldn't carry losslessly is reported, not dropped silently:
for (const d of diagnostics) {
  console.warn(`[${d.kind}] ${d.path}: ${d.message}`);
}

// Prove it's real 3.1 (validates against the official 3.1 meta-schema):
const v = validate31(document);
if (!v.valid) console.error(v.errors); // [{ path, message }, …]
```

## Quick Reference

**downgrade:** `downgrade` (Project a v4 "Suluk" document to OpenAPI 3), `DowngradeResult` (`@suluk/openapi-compat` — convert between the OpenAPI v4 "Suluk" candidate and OpenAPI 3), `Diagnostic` (`@suluk/openapi-compat` — convert between the OpenAPI v4 "Suluk" candidate and OpenAPI 3)
**upgrade:** `upgrade` (Project an OpenAPI 3)
**validate31:** `validate31`, `Validation31`

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When defining typed variables or function parameters → read `references/types.md`

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)