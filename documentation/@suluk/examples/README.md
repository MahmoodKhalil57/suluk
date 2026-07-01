[**Suluk**](../../README.md)

***

[Suluk](../../packages.md) / @suluk/examples

<p align="center">
  <a href="https://github.com/MahmoodKhalil57/suluk">
    <img src="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/wordmark.png" alt="Suluk" width="360" />
  </a>
</p>

<h1 align="center">@suluk/examples</h1>

<p align="center"><b>Example precedence + deterministic, origin-aware schema synthesis — a zero-dependency leaf that picks the best example for a schema and never launders a synthesized value as authoritative.</b></p>

<p align="center">
  <em>Part of <a href="https://github.com/MahmoodKhalil57/suluk">Suluk</a> — one typed OpenAPI v4 contract projecting into every full-stack layer.</em>
</p>

---

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```sh
bun add @suluk/examples
```

## What it does

The shared, **zero-dependency** leaf both [`@suluk/journeys`](../journeys/README.md) (BDD outlines + a runnable
suite) and [`@suluk/sdk`](../sdk/README.md) (typed-client metadata + sampling) read (C040-P2). It imports
**nothing** — no `@suluk`, no external faker — so it sits below both without a dependency cycle and
stays on the value side of the C040 projector wall. It does three things:

- **`resolveExample`** picks a request/response example by **precedence**: a tester-curated `public`
  example wins over a `maintainer` example (explicit, or the schema's own
  `examples` / `example` / `const`), which wins over a **synthetic** value derived from the schema
  shape. A synthetic value is always lowest-precedence, always overridable, and carries
  `synthetic: true` — nothing synthetic is ever presented as authoritative.
- **`synthesize`** is a **deterministic** synthesizer (no randomness, no `Date.now`): same
  `(schema, hint)` → same value, so BDD tests don't flap. `const` / `enum` / `default` / explicit
  `examples` win per node; formats (`email`, `uuid`, `date-time`, …) get sensible representatives.
- **Field origin (C041)** — `describeInputs` reads `x-suluk-origin` (`input` a client may faker /
  `sourced` wired from elsewhere / `computed` server-derived) so a request example drops
  server-`computed` fields and a `sourced` field becomes a machine-wireable edge (`SourceRef`) the
  journeys emitter and the SDK generator can chain via `resolveSourced`.

## Usage

```ts
import { resolveExample, synthesize, describeInputs } from "@suluk/examples";

const schema = {
  type: "object",
  required: ["email"],
  properties: {
    id:    { type: "string", "x-suluk-origin": "computed" }, // server-derived
    email: { type: "string", format: "email" },              // client input
  },
};

// Precedence: public > maintainer > schema example > synthetic.
resolveExample(schema, { maintainer: { email: "given@example.com" } });
// → { value: { email: "given@example.com" }, tier: "maintainer", synthetic: false, provenance: "maintainer-explicit" }

resolveExample(schema);
// → { value: { email: "user@example.com" }, tier: "synthetic", synthetic: true, provenance: "synthetic" }
//   (a REQUEST example drops the `computed` id — a client never sends it)

// A deterministic value for a RESPONSE (drops writeOnly, keeps computed fields):
synthesize(schema, "user", { direction: "response" });

// Which fields a client may freely fill, which are wired, which are server-computed:
describeInputs(schema);
// → [{ name: "id", origin: "computed", fakerable: false, required: false },
//    { name: "email", origin: "input", fakerable: true, required: true }]
```

## What's inside

| Export | What it does |
| --- | --- |
| `resolveExample(schema, sources?, hint?, opts?)` | Pick an example by precedence → `ResolvedExample` (`{ value, tier, synthetic, provenance }`). |
| `synthesize(schema, hint?, opts?)` | A deterministic, schema-shaped example value (filtered by `SynthDirection`). |
| `describeInputs(schema)` | The top-level fields by origin → `FieldDescriptor[]` (`fakerable`, `source`, `required`). |
| `fieldOrigin(schema)` | A property's origin: explicit `x-suluk-origin` > `readOnly ⇒ computed` > default `input`. |
| `asSourceRef(from)` | The structured `{ op, select? }` edge when `x-suluk-from` is wireable (else undefined). |
| `resolveSourced(captured, ref)` | Pull a `sourced` field's value from captured operation results (chaining). |
| `ORIGIN_KEYWORD` / `FROM_KEYWORD` | The `x-suluk-origin` / `x-suluk-from` vendor-extension keys. |

Types `JsonSchema`, `ExampleTier`, `ExampleSources`, `ResolvedExample`, `FieldOrigin`, `FieldSource`,
`SourceRef`, `FieldDescriptor`, `SynthDirection`, and `SynthOptions` are exported alongside.

## Boundary

This package is a **pure, self-contained leaf** — it reads a known subset of JSON Schema and imports
nothing, so any package can consume it without a cycle. It decides *which* example wins and can
*synthesize* a lowest-precedence one, but it never presents synthetic data as authoritative (the
`synthetic: true` marker is the honest never-launder discipline). It is consumed by
[`@suluk/journeys`](../journeys/README.md) and [`@suluk/sdk`](../sdk/README.md).

## License

Apache-2.0

## Interfaces

- [ExampleSources](interfaces/ExampleSources.md)
- [FieldDescriptor](interfaces/FieldDescriptor.md)
- [ResolvedExample](interfaces/ResolvedExample.md)
- [SourceRef](interfaces/SourceRef.md)
- [SynthOptions](interfaces/SynthOptions.md)

## Type Aliases

- [ExampleTier](type-aliases/ExampleTier.md)
- [FieldOrigin](type-aliases/FieldOrigin.md)
- [FieldSource](type-aliases/FieldSource.md)
- [JsonSchema](type-aliases/JsonSchema.md)
- [SynthDirection](type-aliases/SynthDirection.md)

## Variables

- [FROM\_KEYWORD](variables/FROM_KEYWORD.md)
- [ORIGIN\_KEYWORD](variables/ORIGIN_KEYWORD.md)

## Functions

- [asSourceRef](functions/asSourceRef.md)
- [describeInputs](functions/describeInputs.md)
- [fieldOrigin](functions/fieldOrigin.md)
- [resolveExample](functions/resolveExample.md)
- [resolveSourced](functions/resolveSourced.md)
- [synthesize](functions/synthesize.md)
