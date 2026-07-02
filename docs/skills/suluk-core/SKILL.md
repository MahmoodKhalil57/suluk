---
description: "Core library for the OpenAPI v4.0 Suluk candidate: parse, validate, resolve, signature, ADA, match."
name: suluk-core
---

# @suluk/core

Core library for the OpenAPI v4.0 Suluk candidate: parse, validate, resolve, signature, ADA, match.

## Quick Start

```ts
import { parseDocument, validateDocument, buildAda, matchRequest } from "@suluk/core";

const doc = parseDocument(yamlOrJsonSource); // YAML is a superset; JSON parses too

const { valid, errors } = validateDocument(doc);
if (!valid) {
  // errors: { path: string; message: string }[]
  throw new Error(errors.map((e) => `${e.path}: ${e.message}`).join("\n"));
}

const ada = buildAda(doc); // index every request, compute signatures, detect collisions

const match = matchRequest(ada, "GET", "/pet/123?status=available");
// → { operation, pathParams: { petId: "123" }, query: { status: ["available"] } } | null
if (match) {
  match.operation.name;        // "getPet" — the by-name DOM handle (C009)
  match.pathParams.petId;      // "123"
  match.query.status;          // ["available"]
}
```

## Quick Reference

78 exports (24 functions, 49 types, 5 constants) — see references/ for full API.

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)