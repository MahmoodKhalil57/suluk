# Types & Enums

## Types

### `JsonSchema`
A JSON Schema 2020-12 object (the v4 inner-schema shape). Opaque-ish; we read a known subset.
```ts
Record<string, unknown>
```

### `ExampleTier`
Which source supplied the resolved value. `public` (highest) > `maintainer` > `synthetic` (lowest).
```ts
"public" | "maintainer" | "synthetic"
```

### `ExampleSources`
The two human-authored tiers a caller may supply; the synthetic tier is derived from the schema.
**Properties:**
- `public: unknown` (optional) — tier 3 (highest) — a tester-curated, willing-to-expose example. After C040-P4 promotion it also lives in Zod meta.
- `maintainer: unknown` (optional) — tier 2 — an explicit maintainer example (overrides the schema's own `examples`/`example`/`const`).

### `ResolvedExample`
**Properties:**
- `value: unknown`
- `tier: ExampleTier` — which tier won.
- `synthetic: boolean` — true IFF the value was synthesized from the schema shape (the honest never-launder marker).
- `provenance: string` — a short, human-readable note on where the value came from (for reports / docs provenance).

### `FieldOrigin`
`input` = the client is the authority (free, faker-able); `sourced` = retrieved elsewhere (wired); `computed` = server-derived.
```ts
"input" | "sourced" | "computed"
```

### `SourceRef`
A machine-wireable source edge for a `sourced` field: pull `select` (default "id") from operation `op`'s response.
**Properties:**
- `op: string` — the source operation's v4 by-name handle (C009 identity: `op.name`).
- `select: string` (optional) — a dotted path into the source op's RESPONSE to pull (default "id").

### `FieldSource`
`x-suluk-from` is EITHER a free human note (string, doc-only) OR a structured, wireable `SourceRef`.
```ts
string | SourceRef
```

### `FieldDescriptor`
**Properties:**
- `name: string`
- `origin: FieldOrigin`
- `from: string` (optional) — the raw `x-suluk-from` when it is a human note (string).
- `source: SourceRef` (optional) — the machine-wireable edge when `x-suluk-from` is structured `{ op, select? }`.
- `fakerable: boolean` — true IFF a client may freely synthesize/fill it (origin === "input").
- `required: boolean`

### `SynthDirection`
Direction controls origin handling: a "request" example omits server-`computed` fields a client never sends; a
 "response" example omits `writeOnly` fields. Default "request".
```ts
"request" | "response"
```
