---
description: "Generate honestly-provisional backend STUBS from a NEEDS-CONTRACT gap (a tester pre-wrote a scenario the contract can't back). Emits the CONTRACT half generically (a @suluk/hono RouteContract literal with inferred Zod) and the HANDLER half through a HandlerTarget adapter seam (mirroring @suluk/deploy / the C034 runtime seam) — the first adapter is the Effect+run()+RouteError shape. Zero-dep, pure, source-text out. CANDIDATE tooling."
name: suluk-stubgen
---

# @suluk/stubgen

Generate honestly-provisional backend STUBS from a NEEDS-CONTRACT gap (a tester pre-wrote a scenario the contract can't back). Emits the CONTRACT half generically (a @suluk/hono RouteContract literal with inferred Zod) and the HANDLER half through a HandlerTarget adapter seam (mirroring @suluk/deploy / the C034 runtime seam) — the first adapter is the Effect+run()+RouteError shape. Zero-dep, pure, source-text out. CANDIDATE tooling.

## Quick Start

```ts
import { generateStub, generateStubs, honoTarget } from "@suluk/stubgen";

// A gap: the authored intent + the Examples columns (with a sample cell for type inference).
const stub = generateStub({
  intent: "I refund a charge",
  fields: [{ name: "chargeId" }, { name: "amountCents", sample: "500" }],
});

stub.name;     // "refundCharge"  — inferred from the intent
stub.contract; // the @suluk/hono RouteContract literal (paste into contractDoc([...]))
stub.handler;  // the Effect + run() + RouteError handler (honoEffectTarget by default)
```

## Quick Reference

**Functions:** `stubSpec` (Resolve a gap to a renderable spec (inferring name/method/path/fields where not given)), `renderContract` (Render the CONTRACT half — a `@suluk/hono` RouteContract literal to paste into `contractDoc([), `generateStub` (Generate the contract + handler stub for one gap, lowered through a handler target), `generateStubs` (Generate stubs for many gaps)
**Types:** `StubField` (`@suluk/stubgen` — turn a NEEDS-CONTRACT gap (a tester pre-wrote a scenario the contract can't back yet) into
honestly-provisional backend STUBS the maintainer then writes pragmatically), `StubGap` (The input: a gap the contract cannot back, optionally with the Examples columns that hint the request shape), `StubSpec` (The resolved, renderable stub), `HandlerTarget` (The handler-emit adapter seam — a target renders the HANDLER half in its app's idiom), `GeneratedStub`
**Constants:** `honoEffectTarget` (The toolfactory idiom: an Effect program + the run() boundary + a contract-derived RouteError), `honoTarget` (A framework-generic Hono fallback target)

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)