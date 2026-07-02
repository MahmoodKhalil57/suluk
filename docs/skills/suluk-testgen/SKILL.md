---
description: "Generate a DETERMINISTIC conformance test suite from a v4 'Suluk' contract — the executable form of the contract's claims. Asserts the SERVER ENFORCES x-suluk-access on the real wire (anon rejected on non-public ops; public ops reachable), smoke-tests declared statuses, validates 2xx bodies against their declared schemas, and checks every declared cost is well-formed. A pure function of the document — same contract in, same suite out, no network at generate-time. CANDIDATE tooling."
name: suluk-testgen
---

# @suluk/testgen

Generate a DETERMINISTIC conformance test suite from a v4 'Suluk' contract — the executable form of the contract's claims. Asserts the SERVER ENFORCES x-suluk-access on the real wire (anon rejected on non-public ops; public ops reachable), smoke-tests declared statuses, validates 2xx bodies against their declared schemas, and checks every declared cost is well-formed. A pure function of the document — same contract in, same suite out, no network at generate-time. CANDIDATE tooling.

## Quick Start

```ts
import { generateTests } from "@suluk/testgen";
import type { OpenAPIv4Document } from "@suluk/core";

const suite = generateTests(document, { baseURL: "https://api.example.com" });
// → a self-contained test-file string. Write it next to your tests and run it:
await Bun.write("api.conformance.test.ts", suite);
```

## Configuration

2 configuration interfaces — see references/config.md for details.

## Quick Reference

**generate:** `generateTests` (`@suluk/testgen` — generate a DETERMINISTIC conformance test suite from a v4 "Suluk" contract)
**money:** `generateMoneyTests` (Emit the money-correctness conformance suite as a self-contained test-file string)

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When configuring options → read `references/config.md` for all settings and defaults

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)