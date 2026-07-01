[**Suluk**](../../README.md)

***

[Suluk](../../packages.md) / @suluk/openapi-compat

<p align="center">
  <a href="https://github.com/MahmoodKhalil57/suluk">
    <img src="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/wordmark.png" alt="Suluk" width="360" />
  </a>
</p>

<h1 align="center">@suluk/openapi-compat</h1>

<p align="center"><b>Lossless-where-possible conversion between the OpenAPI v4 "Suluk" candidate and OpenAPI 3.1 — the dialect Scalar and Swagger UI consume.</b></p>

<p align="center">
  <em>Part of <a href="https://github.com/MahmoodKhalil57/suluk">Suluk</a> — one typed OpenAPI v4 contract projecting into every full-stack layer.</em>
</p>

---

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```sh
bun add @suluk/openapi-compat
```

## What it does

- **`downgrade(v4) → 3.1`** — projects a v4 "Suluk" document down to a real OpenAPI 3.1 document, the lever
  that lets 3.x-only renderers (Scalar, Swagger UI) show a v4 contract. Name-keyed `requests` become
  method-keyed Operations, per-location `parameterSchema` objects expand into `parameters[]`, and the v4
  request name is preserved as the `operationId` (round-trippable).
- **`upgrade(3.1) → v4`** — the reverse projection. Method-keyed Operations become name-keyed `requests`;
  flat `parameters[]` re-collect into per-location `parameterSchema` objects.
- **Honest diagnostics, never silent loss.** Where v4 exceeds 3.1's expressivity — most notably two requests
  sharing one method on one path (C003) — `downgrade` keeps the first and emits a `Diagnostic` naming what was
  dropped, instead of losing it quietly. `diagnostics` is the audit trail.
- **`validate31(doc)`** — checks a document against the vendored official OpenAPI 3.1 meta-schema (plus a real
  JSON-Schema-2020-12 pass over every Schema Object), proving the downgrade output is 3.1 a renderer will accept.
- **Schema Objects pass through verbatim.** v4 and 3.1 share JSON Schema 2020-12 (SPEC C013 == OAS 3.1), so no
  Schema Object is rewritten in either direction — only the surrounding structure changes.

## When to reach for it

- You have a v4 document and need to feed it to a tool that only speaks OpenAPI 3.x. `downgrade` is the on-ramp;
  it's exactly what `@suluk/scalar` and `@suluk/swagger` call internally before handing the spec to their bundles.
- You're ingesting a standard OpenAPI 3.1 (or 3.0, after normalization) document and want it as a v4 contract —
  the "Upgrade from 3.1" flow in `@suluk/editor`, or `@suluk/better-auth`'s ingest of Better Auth's own schema.
- You want a checked, lossless-where-possible round-trip and an explicit list of what 3.1 cannot represent.

Reach for a sibling instead when you want the rendered page, not the converted document: `@suluk/scalar` and
`@suluk/swagger` produce self-contained HTML (and attach the v4 facet badges a plain downgrade would drop).
This package is just the conversion + validation primitive underneath them.

## Usage

### Downgrade a v4 document to 3.1

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

`downgrade` returns `{ document, diagnostics }`. Each `Diagnostic` is `{ kind, path, message }` where
`kind` is `"collision"` (lossy — two requests clash on one method), `"remap"` (a `$ref`/feature was rewritten),
or `"drop"` (unrepresentable, e.g. a non-3.1 HTTP method).

### Upgrade a 3.1 document up to v4

```ts
import { upgrade } from "@suluk/openapi-compat";

const v4doc = upgrade(spec31); // spec31: a parsed OpenAPI 3.1 document (plain object)
// → OpenAPIv4Document with openapi: "4.0.0-candidate"
// Operations become name-keyed `requests`; operationId becomes the request name.
```

A document that came **from** `downgrade()` carries `operationId == the original v4 request name`, so the
round-trip recovers the original names:

```ts
import { downgrade, upgrade } from "@suluk/openapi-compat";

const back = upgrade(downgrade(v4).document); // names + methods recovered through the 3.1 hop
```

## API

| Export | Signature | What it does |
| --- | --- | --- |
| `downgrade` | `(doc: OpenAPIv4Document) => DowngradeResult` | v4 → 3.1; returns `{ document, diagnostics }`. |
| `upgrade` | `(doc31: Record<string, unknown>) => OpenAPIv4Document` | 3.1 → v4 (the reverse projection). |
| `validate31` | `(document: unknown) => Validation31` | Validate against the official 3.1 meta-schema; `{ valid, errors }`. |
| `DowngradeResult` | `{ document: Record<string, unknown>; diagnostics: Diagnostic[] }` | type — the downgrade output. |
| `Diagnostic` | `{ kind: "collision" \| "remap" \| "drop"; path: string; message: string }` | type — one lossy/rewrite note. |
| `Validation31` | `{ valid: boolean; errors: { path: string; message: string }[] }` | type — the validation result. |

The package has a single entry point (`@suluk/openapi-compat`) — no sub-path exports and no CLI.

## Boundary

`@suluk/openapi-compat` is a pure conversion + validation library: three functions, no I/O, no globals, Workers-safe.
It **does not** render a page, fetch a remote document, or host anything — it hands back a converted document and an
honest diagnostics list, and the caller decides what to do with them. The rendered surfaces (`@suluk/scalar`,
`@suluk/swagger`, `@suluk/editor`) are thin shells on top of it: they `downgrade`, then attach v4 facet badges and
wrap the result in HTML.

The one rule when contributing: `downgrade` must emit an honest `Diagnostic` for anything 3.1 cannot express —
extend the diagnostics, never the silence.

## License

Apache-2.0

## Interfaces

- [Diagnostic](interfaces/Diagnostic.md)
- [DowngradeResult](interfaces/DowngradeResult.md)
- [Validation31](interfaces/Validation31.md)

## Functions

- [downgrade](functions/downgrade.md)
- [upgrade](functions/upgrade.md)
- [validate31](functions/validate31.md)
