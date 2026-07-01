[**Suluk**](../../README.md)

***

[Suluk](../../packages.md) / @suluk/testgen

# @suluk/testgen

**Generate a deterministic conformance test suite from a v4 "Suluk" contract — the contract's claims, made executable.**

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```bash
bun add @suluk/testgen @cfworker/json-schema
```

`@cfworker/json-schema` is a peer dependency — the *generated* suite imports it to validate response
bodies against their declared schemas. `generateMoneyTests` additionally targets `@suluk/stripe` (the
emitted suite imports the pricing primitives from there).

## What it does

`generateTests(doc)` walks a v4 document and emits a **self-contained test file** (a string) that runs
against a live deployment. It turns the `x-suluk-*` facets from decoration into load-bearing claims:

- **Access enforcement, on the real wire.** A non-public op must DENY anon a success; a public op must be
  reachable by anon. `x-suluk-access` is only the *expectation* — the test passes iff the wire agrees. It
  never asserts over a projection and never treats the facet as if it were the enforcement (C022 inv.3).
- **Status smoke + schema conformance.** A public, parameter-free GET returns a *declared* status, and its
  2xx body validates against the declared response schema (same generic JSON-Schema engine the SDK uses).
- **Error-conformance.** A denied request returns a well-formed RFC-9457 Problem Details body (the shared
  `@suluk/hono` envelope: `title` string + `status` matching the HTTP status).
- **Cost declared.** Every op that prices itself declares a well-formed `x-suluk-cost` — checked statically,
  never as a literal µ$ amount (which would couple tests to billing internals and go flaky).

A **pure function of the document**: same contract in, same suite out, no network at generate-time. Each op's
tests are labelled with its provenance (`x-suluk-source`) so a failure points at the authoring source.

`generateMoneyTests()` is a separate emitter for the money path — an in-process suite over the `@suluk/stripe`
pricing primitives (anti-tampering, integer-cents, never-over-discount, exact proration, deterministic
idempotency). It takes no document; the invariants live in the shared primitives, not in any one contract.

## When to reach for it

Reach for it whenever you want the contract's facets to *mean something* — this is what makes `x-suluk-*`
enforced rather than aspirational. The common pattern is to expose the generated suite as a download endpoint
so any consumer can verify your deployment honours its own contract (see Usage). Add `generateMoneyTests` when
your app touches checkout/billing through `@suluk/stripe`.

This is a **generator**, not a runner: it produces a `bun:test` (or `vitest`) file you run yourself. It is the
testing facet of the projection model — siblings like `@suluk/scalar` / `@suluk/swagger` *render* the contract;
`@suluk/sdk` *generates a client*; this generates the *conformance proof*.

## Usage

### Generate a conformance suite from a v4 document

```ts
import { generateTests } from "@suluk/testgen";
import type { OpenAPIv4Document } from "@suluk/core";

const suite = generateTests(document, { baseURL: "https://api.example.com" });
// → a self-contained test-file string. Write it next to your tests and run it:
await Bun.write("api.conformance.test.ts", suite);
```

Run the emitted suite against a deployment — `SULUK_BASE_URL` wins over the baked-in `baseURL`:

```bash
SULUK_BASE_URL=https://api.example.com bun test api.conformance.test.ts
```

Optional positive-side checks (a non-public op also asserting a *valid* principal IS allowed through) are
skipped unless you provide **synthetic** principal tokens — never a production credential:

```bash
SULUK_ADMIN_TOKEN=… SULUK_USER_TOKEN=… bun test api.conformance.test.ts
```

### Serve it as a download endpoint (real saasuluk usage)

```ts
import { generateTests } from "@suluk/testgen";

app.get("/conformance.test.ts", (c) =>
  new Response(generateTests(document, { baseURL: new URL(c.req.url).origin }), {
    headers: {
      "content-type": "application/typescript; charset=utf-8",
      "content-disposition": 'attachment; filename="api.conformance.test.ts"',
    },
  }),
);
```

### Options

```ts
generateTests(document, {
  baseURL: "https://api.example.com", // baked default; SULUK_BASE_URL overrides at run-time
  framework: "vitest",                // "bun" (default) | "vitest" — toggles the emitted imports
});
```

### Money-correctness suite

```ts
import { generateMoneyTests } from "@suluk/testgen";

const money = generateMoneyTests();                 // imports primitives from "@suluk/stripe"
await Bun.write("money.conformance.test.ts", money);
// then: bun test money.conformance.test.ts (no network, in-process)

// configurable runner + import specifier:
generateMoneyTests({ framework: "vitest", stripeModule: "../pricing" });
```

## API

| Export | What it does |
| --- | --- |
| `generateTests(doc, opts?)` | Emit a wire-conformance suite (access / status / schema / cost) from a v4 document, as a test-file string. |
| `generateMoneyTests(opts?)` | Emit an in-process money-correctness suite over the `@suluk/stripe` pricing primitives. |
| `TestgenOptions` | `{ baseURL?: string; framework?: "bun" \| "vitest" }`. |
| `MoneyTestsOptions` | `{ framework?: "bun" \| "vitest"; stripeModule?: string }`. |

## Boundary

This package **generates, never hosts** (L3). It is a pure string-emitter: no network at generate-time, no
deployment of its own. The seams it leaves to the app:

- **The deployment under test** is injected via `SULUK_BASE_URL` (or the baked `baseURL`) at *run*-time — the
  generated suite reads it from the environment.
- **Authorization is the server's job.** The access tests assert the *wire* enforces `x-suluk-access`; this
  never re-implements authz, and never asserts over a projection (C022 inv.3 — the server is the only boundary).
- **Synthetic principals** for the optional positive-side checks come from you (`SULUK_*_TOKEN`), out of band.
- **Running** the emitted file is the app's responsibility (`bun test`); you decide where to write it and when
  to run it in CI.

Contributing: a new facet means a new asserted claim here — that is what keeps `x-suluk-*` load-bearing.

## License

Apache-2.0.

## Interfaces

- [MoneyTestsOptions](interfaces/MoneyTestsOptions.md)
- [TestgenOptions](interfaces/TestgenOptions.md)

## Functions

- [generateMoneyTests](functions/generateMoneyTests.md)
- [generateTests](functions/generateTests.md)
