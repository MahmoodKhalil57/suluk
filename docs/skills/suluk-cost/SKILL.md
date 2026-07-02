---
description: "Cost as a contract facet: declare per-operation cost (incl. third-party usage), bubble it into the v4 doc/Scalar/tests, and meter the ACTUAL per-user cost at runtime (frontend action -> operation -> third-party). Display as-is. CANDIDATE tooling."
name: suluk-cost
---

# @suluk/cost

Cost as a contract facet: declare per-operation cost (incl. third-party usage), bubble it into the v4 doc/Scalar/tests, and meter the ACTUAL per-user cost at runtime (frontend action -> operation -> third-party). Display as-is. CANDIDATE tooling.

## Quick Start

```ts
import { annotateCosts, costAudit, costTable, type CostModel } from "@suluk/cost";
import { emitV4 } from "@suluk/hono";

const ask: CostModel = {
  components: [
    { source: "compute", basis: "per-call", microUsd: 50 },
    { source: "openai", basis: "per-1k-tokens", microUsd: 2000, description: "$0.002 / 1k tokens" },
  ],
  estimateMicroUsd: 1050, // typical total for display/tests before usage is known
};

const { document } = emitV4(/* operations… */);

// Set x-suluk-cost on each named operation (returns a new doc; covers paths + webhooks).
const annotated = annotateCosts(document, { ask });

// Coverage audit — which operations never declared a cost (warns), plus background-cost disciplines.
for (const f of costAudit(annotated)) console.warn(f.code, f.operation, f.message);

// The declared costs, raw, for an admin/cockpit table.
console.table(costTable(annotated)); // [{ operation, path, estimateMicroUsd, sources, trigger }]
```

## Configuration

**CostMeterOptions** (6 options — see references/config.md)

## Quick Reference

44 exports (23 functions, 1 classes, 18 types, 2 constants) — see references/ for full API.

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When using a class → read `references/classes.md` for properties, methods, and inheritance
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`
- When configuring options → read `references/config.md` for all settings and defaults

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)