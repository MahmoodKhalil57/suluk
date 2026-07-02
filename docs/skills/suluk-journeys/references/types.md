# Types & Enums

## vocabulary

### `Vocabulary`
`@suluk/journeys` — intuitive, runnable BDD over a v4 "Suluk" contract.

A non-technical author (PM / BA / QA) writes Gherkin user-stories/journeys against a step VOCABULARY projected
deterministically from the contract; the BINDER resolves each step EXACT-or-UNBOUND (outcomes relative to the
scenario's When-subject) and emits a bidirectional TRI-STATE gap report; the EMITTER lowers bound scenarios to a
runnable bun:test suite driven through @suluk/sdk's generated client. A pure function of the document. CANDIDATE tooling.

The vocabulary names only contract facts (operations, params, statuses, store keys, access roles) — never request
VALUES — so it stays on the safe side of the D1 wall; the @suluk/core matcher never imports this package.
**Properties:**
- `steps: JourneyStep[]` — every generated step, sorted deterministically.
- `operations: VocabOperation[]` — the operation table (for coverage + the phrasebook).

### `JourneyStep`
`@suluk/journeys` — intuitive, runnable BDD over a v4 "Suluk" contract.

A non-technical author (PM / BA / QA) writes Gherkin user-stories/journeys against a step VOCABULARY projected
deterministically from the contract; the BINDER resolves each step EXACT-or-UNBOUND (outcomes relative to the
scenario's When-subject) and emits a bidirectional TRI-STATE gap report; the EMITTER lowers bound scenarios to a
runnable bun:test suite driven through @suluk/sdk's generated client. A pure function of the document. CANDIDATE tooling.

The vocabulary names only contract facts (operations, params, statuses, store keys, access roles) — never request
VALUES — so it stays on the safe side of the D1 wall; the @suluk/core matcher never imports this package.
**Properties:**
- `kind: StepKind` — Given / When / Then.
- `phrase: string` — the human-readable phrase an author writes, e.g. "When I checkout".
- `skeleton: string` — the normalized matching skeleton (slot values stripped).
- `handle: string` — stable identity: `op.name@path-uri`, or `@access:<role>` for a Given.
- `via: string` — provenance of this phrase (which contract fact produced it).

### `VocabOperation`
`@suluk/journeys` — intuitive, runnable BDD over a v4 "Suluk" contract.

A non-technical author (PM / BA / QA) writes Gherkin user-stories/journeys against a step VOCABULARY projected
deterministically from the contract; the BINDER resolves each step EXACT-or-UNBOUND (outcomes relative to the
scenario's When-subject) and emits a bidirectional TRI-STATE gap report; the EMITTER lowers bound scenarios to a
runnable bun:test suite driven through @suluk/sdk's generated client. A pure function of the document. CANDIDATE tooling.

The vocabulary names only contract facts (operations, params, statuses, store keys, access roles) — never request
VALUES — so it stays on the safe side of the D1 wall; the @suluk/core matcher never imports this package.
**Properties:**
- `handle: string`
- `name: string`
- `path: string`
- `method: string`
- `access: string`

### `StepKind`
`@suluk/journeys` — intuitive, runnable BDD over a v4 "Suluk" contract.

A non-technical author (PM / BA / QA) writes Gherkin user-stories/journeys against a step VOCABULARY projected
deterministically from the contract; the BINDER resolves each step EXACT-or-UNBOUND (outcomes relative to the
scenario's When-subject) and emits a bidirectional TRI-STATE gap report; the EMITTER lowers bound scenarios to a
runnable bun:test suite driven through @suluk/sdk's generated client. A pure function of the document. CANDIDATE tooling.

The vocabulary names only contract facts (operations, params, statuses, store keys, access roles) — never request
VALUES — so it stays on the safe side of the D1 wall; the @suluk/core matcher never imports this package.
```ts
"given" | "when" | "then"
```

## gherkin

### `Feature`
**Properties:**
- `feature: string`
- `scenarios: Scenario[]`

### `Scenario`
**Properties:**
- `name: string`
- `rule: string` (optional) — the `Rule:` this scenario sits under, if any.
- `steps: FeatureStep[]`
- `line: number`
- `tags: string[]` (optional) — tags on this scenario (the leading `@` stripped), e.g. ["public"].
- `examples: { headers: string[]; rows: string[][]; tags?: string[] }` (optional) — the captured `Examples:` table of a Scenario Outline (C040-P1); absent for a plain Scenario. `tags` are from a
 `@public`-style line directly above the `Examples:` keyword (C040-P4 promote selection).

### `FeatureStep`
**Properties:**
- `kind: StepKind` — the RESOLVED keyword (And/But fold into the preceding Given/When/Then).
- `text: string` — the step text after the keyword.
- `raw: string` — the raw line as written (for reporting).
- `line: number` — 1-based source line number (for file:line hand-offs).

## outline

### `ScenarioOutline`
**Properties:**
- `op: string` — the operation's v4 by-name handle.
- `method: string`
- `uri: string`
- `whenPhrase: string` — the `When` step text (placeholders reference the Examples columns).
- `columns: OutlineColumn[]` — client-facing input columns (computed fields dropped). Empty ⇒ a plain Scenario, no Examples table.

### `OutlineColumn`
**Properties:**
- `name: string`
- `origin: FieldOrigin`
- `seed: string` — the seed cell for the first Examples row: a synthesized value (`input`) or a `<op.select>` wiring token (`sourced`).

## promote

### `PublicExampleRow`
**Properties:**
- `scenario: string`
- `headers: string[]`
- `row: string[]` — the FIRST row of the `@public`-tagged Examples block — the canonical public example.

### `PromoteResult`
**Properties:**
- `source: string`
- `changed: boolean`
- `reason: string`

### `PromoteTarget`
**Properties:**
- `schemaVar: string` — the Zod `const` name to edit.
- `bodySchema: JsonSchema` (optional) — the op's request body schema (for typed cell coercion); optional.

### `PromoteFeatureResult`
**Properties:**
- `source: string`
- `applied: { scenario: string; schemaVar: string; reason: string }[]`
- `skipped: { scenario: string; reason: string }[]`

## bind

### `GapReport`
**Properties:**
- `scenarios: ScenarioResult[]`
- `counts: Record<BindState, number>`
- `coverage: { total: number; covered: number; holes: CoverageHole[] }`

### `ScenarioResult`
**Properties:**
- `scenario: string`
- `rule: string` (optional)
- `subject: string` — the FIRST bound When-op handle (a label/back-compat handle; outcomes bind to the most-recent When, see results).
- `results: StepResult[]`

### `StepResult`
**Properties:**
- `step: FeatureStep`
- `state: BindState`
- `handle: string` — the bound (or suggested) handle, when there is one.
- `via: string` — provenance of a BOUND step.
- `suggest: string` — a human next-action for a non-BOUND step.
- `expandedFrom: { text: string; line: number }` (optional) — when this resolved step came from an alias/decomposition/journey expansion: the original authored prose it expanded from.
- `canonical: string` (optional) — the canonical step phrase this UNBOUND step most likely maps to (drives the scaffolder's alias stub).

### `BindState`
```ts
"BOUND" | "PARAPHRASE" | "NEEDS-DEV-GLUE" | "NEEDS-CONTRACT" | "AMBIGUOUS" | "UNDEFINED"
```

### `CoverageHole`
**Properties:**
- `handle: string`
- `name: string`
- `stub: string` — a one-line drop-in stub scenario to cover this operation.

### `Definitions`
The SCAFFOLDER's mapping layer (author-owned data, no developer). Turns a non-technical author's free prose into
runnable Gherkin without touching code.
**Properties:**
- `steps: Record<string, string | string[]>` (optional) — a free-prose step (normalized) → a canonical generated phrase (ALIAS) OR an ordered list of canonical phrases
 (manual DECOMPOSITION). Each canonical phrase carries its keyword, e.g. "When I checkout" / "Then it succeeds".
- `journeys: Record<string, string[]>` (optional) — named JOURNEYS for composition: a journey name → an ordered list of step phrases (each itself bound or defined).
 Referenced from a story with `When I complete the "<name>" journey`.

### `UndefinedStep`
**Properties:**
- `scenario: string`
- `text: string` — the original authored prose (the non-technical author's words).
- `line: number`
- `resolution: "alias" | "map" | "review" | "define-journey"` — How to make it run. NONE of these requires a developer EXCEPT where the scaffolder, on review, finds no operation
provides the capability — then they escalate. The tool only ever SUGGESTS; it never asserts "a developer is required",
because absence of a lexical match is not evidence the capability is missing.
 - `alias` — a confident 1:1 target was found (a paraphrase of a generated step).
 - `map` — a related operation was found; map it (alias or decompose) to that op's steps.
 - `review` — no automatic match; the scaffolder maps it from the phrasebook, or escalates only if nothing backs it.
 - `define-journey` — a reference to a journey that is not defined yet.
- `suggestion: string` — a paste-ready definitions stub (or, for `review`, the honest "decide" note).

## demos

### `DemoScenario`
**Properties:**
- `name: string`
- `requests: DemoRequest[]`

### `DemoRequest`
**Properties:**
- `label: string` — the human label (the op name).
- `name: string` — the op's by-name handle name (for chaining resolution).
- `method: string`
- `path: string` — path with `{param}` substituted to a row value or a `{{param}}` variable; prefixed with `{{baseUrl}}` at render.
- `needsAuth: boolean`
- `body: Record<string, DemoValue>` (optional)
- `captures: DemoCapture[]`

### `DemoValue`
A request value: a concrete literal, or a `{{var}}` reference to a captured upstream response field.
```ts
{ kind: "literal"; value: unknown } | { kind: "var"; name: string }
```

### `DemoCapture`
Capture `res.<from>` of this request into the collection variable `var` (for downstream chaining).
**Properties:**
- `var: string`
- `from: string`

## cli

### `DemoFormat`
```ts
"bruno" | "postman" | "both"
```

### `DemoFilesResult`
**Properties:**
- `files: Record<string, string>` — relative path → file content. When format is "both", Bruno files are under `bruno/`, Postman under `postman/`.
- `scenarios: number`
- `requests: number`

### `PromoteTargetSpec`
A `--target "<scenario>=<file>#<schemaVar>"` mapping.
**Properties:**
- `file: string`
- `schemaVar: string`

### `PromotionPlan`
**Properties:**
- `files: PromotionFileResult[]`
- `rows: PromotionRow[]`

### `PromotionRow`
**Properties:**
- `scenario: string`
- `file: string` (optional)
- `schemaVar: string` (optional)
- `status: "applied" | "skipped"`
- `reason: string`

### `PromotionFileResult`
**Properties:**
- `file: string`
- `original: string`
- `updated: string`
- `changed: boolean`

### `AuditResult`
**Properties:**
- `security: DimensionAudit` — schema input-hardening (security) — `@suluk/harden` auditDocument.
- `readiness: DimensionAudit` — schema-fact readiness (computed-required / missing-example) — `@suluk/harden` auditReadiness.
- `coverage: CoverageGrade` (optional) — BDD contract coverage — present only when `.feature` files were given.
- `combined: { worst: Grade; average: Grade; grades: Grade[] }` — the combined grade (worst is the safe value to gate on).

### `DimensionAudit`
**Properties:**
- `grade: Grade`
- `score: number`
- `findings: Finding[]`

## coverage

### `CoverageGrade`
**Properties:**
- `grade: Grade`
- `score: number`
- `covered: number`
- `total: number`
- `uncovered: string[]` — uncovered operation names — the "gaps"; generate a Scenario Outline for each (renderScenarioOutlines).

## `JsonSchema`
A JSON Schema 2020-12 object (the v4 inner-schema shape). Opaque-ish; we read a known subset.
```ts
Record<string, unknown>
```

## `ExampleTier`
Which source supplied the resolved value. `public` (highest) > `maintainer` > `synthetic` (lowest).
```ts
"public" | "maintainer" | "synthetic"
```

## `ExampleSources`
The two human-authored tiers a caller may supply; the synthetic tier is derived from the schema.
**Properties:**
- `public: unknown` (optional) — tier 3 (highest) — a tester-curated, willing-to-expose example. After C040-P4 promotion it also lives in Zod meta.
- `maintainer: unknown` (optional) — tier 2 — an explicit maintainer example (overrides the schema's own `examples`/`example`/`const`).

## `ResolvedExample`
**Properties:**
- `value: unknown`
- `tier: ExampleTier` — which tier won.
- `synthetic: boolean` — true IFF the value was synthesized from the schema shape (the honest never-launder marker).
- `provenance: string` — a short, human-readable note on where the value came from (for reports / docs provenance).

## `FieldOrigin`
`input` = the client is the authority (free, faker-able); `sourced` = retrieved elsewhere (wired); `computed` = server-derived.
```ts
"input" | "sourced" | "computed"
```

## `SourceRef`
A machine-wireable source edge for a `sourced` field: pull `select` (default "id") from operation `op`'s response.
**Properties:**
- `op: string` — the source operation's v4 by-name handle (C009 identity: `op.name`).
- `select: string` (optional) — a dotted path into the source op's RESPONSE to pull (default "id").

## `FieldSource`
`x-suluk-from` is EITHER a free human note (string, doc-only) OR a structured, wireable `SourceRef`.
```ts
string | SourceRef
```

## `FieldDescriptor`
**Properties:**
- `name: string`
- `origin: FieldOrigin`
- `from: string` (optional) — the raw `x-suluk-from` when it is a human note (string).
- `source: SourceRef` (optional) — the machine-wireable edge when `x-suluk-from` is structured `{ op, select? }`.
- `fakerable: boolean` — true IFF a client may freely synthesize/fill it (origin === "input").
- `required: boolean`

## `SynthDirection`
Direction controls origin handling: a "request" example omits server-`computed` fields a client never sends; a
 "response" example omits `writeOnly` fields. Default "request".
```ts
"request" | "response"
```
