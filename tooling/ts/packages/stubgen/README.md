<p align="center">
  <a href="https://github.com/MahmoodKhalil57/suluk">
    <img src="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/wordmark.png" alt="Suluk" width="360" />
  </a>
</p>

<h1 align="center">@suluk/stubgen</h1>

<p align="center"><b>Turn a NEEDS-CONTRACT gap — a scenario a tester pre-wrote that the contract can't back yet — into honestly-provisional backend stubs: a <code>@suluk/hono</code> contract literal plus a handler through an adapter seam.</b></p>

<p align="center">
  <em>Part of <a href="https://github.com/MahmoodKhalil57/suluk">Suluk</a> — one typed OpenAPI v4 contract projecting into every full-stack layer.</em>
</p>

---

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```sh
bun add @suluk/stubgen
```

## What it does

In the journeys arc a tester can pre-write a scenario the contract can't back yet — a
**NEEDS-CONTRACT gap**. `@suluk/stubgen` turns that gap into two provisional halves the maintainer
then writes pragmatically (C040-P3):

- **The contract half is generic.** `renderContract` emits a [`@suluk/hono`](../hono) `RouteContract`
  literal — method / path / name inferred from the intent text (`"I refund a charge"` → `refundCharge`,
  `POST`, `/refund-charge`), the request Zod inferred from the gap's Examples columns, responses a
  placeholder. Every inference is tagged `// TODO: tighten`: the inferred Zod is **lossy by
  construction** and the maintainer owns the final schema — nothing is laundered as authoritative.
- **The handler half goes through an adapter seam.** Because the handler idiom is app-specific,
  `HandlerTarget` is the seam (mirroring `@suluk/deploy`'s provider seam). The first adapter,
  `honoEffectTarget`, emits the toolfactory idiom (an `Effect` program + the `run()` boundary + a
  contract-derived `RouteError<name>`); `honoTarget` is a framework-generic fallback.

Zero-dependency and pure — source text in, source text out. `@suluk/core` never imports it, and it
imports nothing.

## Usage

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

`stub.contract` renders (Zod inferred, `amountCents` seen as a number, every inference flagged):

```ts
// STUB contract (generated from a NEEDS-CONTRACT gap: "I refund a charge"). Tighten Zod + responses, then implement the handler.
{
  method: "post",
  path: "/refund-charge",
  name: "refundCharge",
  summary: "TODO: describe refundCharge.",
  request: { json: z.object({ chargeId: z.string() /* TODO: tighten */, amountCents: z.number() /* TODO: tighten */ }) },
  responses: [{ status: 200, schema: z.object({}) /* TODO: response shape */ }],
},
```

Choose the framework-generic handler idiom instead of the Effect one, or batch many gaps:

```ts
const generic = generateStub({ intent: "I list invoices" }, honoTarget);
const all = generateStubs([{ intent: "I create a webhook" }, { intent: "I delete a key" }]);
```

## What's inside

| Export | What it does |
| --- | --- |
| `generateStub(gap, target?)` | The contract + handler for one gap → `GeneratedStub` (defaults to `honoEffectTarget`). |
| `generateStubs(gaps, target?)` | The same for many gaps. |
| `stubSpec(gap)` | Resolve a gap to a renderable `StubSpec` (infers name / method / path / field types). |
| `renderContract(spec)` | The generic `@suluk/hono` `RouteContract` literal half. |
| `honoEffectTarget` | The `HandlerTarget` for the toolfactory idiom (Effect + `run()` + `RouteError`). |
| `honoTarget` | A framework-generic Hono `HandlerTarget` fallback. |

Types `StubGap`, `StubSpec`, `StubField`, `HandlerTarget`, and `GeneratedStub` are exported
alongside.

## Boundary

`@suluk/stubgen` emits **honestly-provisional** source text and nothing more — every inference is
lossy and flagged `// TODO: tighten`, so the maintainer owns the final contract and never inherits a
laundered schema. It is zero-dependency and pure; the app-specific handler idiom is injected through
the `HandlerTarget` seam. It's the gap-filling step of the [`@suluk/journeys`](../journeys) arc and
emits contracts for [`@suluk/hono`](../hono).

## License

Apache-2.0
