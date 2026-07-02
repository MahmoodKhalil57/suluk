---
description: The pure cockpit core (cycle model · builder model · codegen · deploy planning · validate/audit/preview) shared by the vscode extension and the /superadmin web admin panel. CANDIDATE tooling.
name: suluk-cockpit
---

# @suluk/cockpit

The pure cockpit core (cycle model · builder model · codegen · deploy planning · validate/audit/preview) shared by the vscode extension and the /superadmin web admin panel. CANDIDATE tooling.

## Quick Start

```ts
import { parseDocument } from "@suluk/core";
import { buildCycle, cycleSummary } from "@suluk/cockpit";

const doc = parseDocument(source); // a v4 "Suluk" document
const model = buildCycle(doc);

model.valid;     // passes the v4 meta-schema?
model.coverage;  // documentation coverage 0..1
cycleSummary(model);
// → [{ layer: "Data (entities)", summary: "3 entities", status: "ok" }, … ]

// Project for a principal — scope-gated operations they can't reach drop out of every layer:
const asViewer = buildCycle(doc, { principal: { scopes: ["read:pets"] } });
```

## Quick Reference

116 exports (59 functions, 51 types, 6 constants) — see references/ for full API.

## References

Load these on demand — do NOT read all at once:

- When calling any function → browse `references/functions/` for grouped indexes, full signatures, parameters, and return types
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)