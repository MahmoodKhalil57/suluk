# Functions

## vocabulary

### `generateVocabulary`
Project a v4 document into the deterministic step vocabulary.
```ts
generateVocabulary(doc: OpenAPIv4Document): Vocabulary
```
**Parameters:**
- `doc: OpenAPIv4Document`
**Returns:** `Vocabulary`

### `renderPhrasebook`
A foldable, entity-grouped phrasebook (Markdown) — the human surface an author picks step phrases from.
```ts
renderPhrasebook(vocab: Vocabulary): string
```
**Parameters:**
- `vocab: Vocabulary`
**Returns:** `string`

### `vocabularyHash`
A deterministic content hash of the vocabulary (djb2 hex) — for drift detection / the build artifact.
```ts
vocabularyHash(vocab: Vocabulary): string
```
**Parameters:**
- `vocab: Vocabulary`
**Returns:** `string`

### `opHandle`
Stable by-name handle.
```ts
opHandle(name: string, path: string): string
```
**Parameters:**
- `name: string`
- `path: string`
**Returns:** `string`

## gherkin

### `parseFeature`
```ts
parseFeature(src: string): Feature
```
**Parameters:**
- `src: string`
**Returns:** `Feature`

## outline

### `buildScenarioOutlines`
Build the structured outlines for every operation that has a client-facing request body.
```ts
buildScenarioOutlines(doc: OpenAPIv4Document): ScenarioOutline[]
```
**Parameters:**
- `doc: OpenAPIv4Document`
**Returns:** `ScenarioOutline[]`

### `renderScenarioOutlines`
Render the generated outlines as a `.feature` SIDECAR a tester expands. A column-bearing op becomes a `Scenario
Outline:` + a one-row `Examples:` table; a body-less op becomes a plain `Scenario:`.
```ts
renderScenarioOutlines(doc: OpenAPIv4Document, opts: OutlineRenderOptions): string
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `opts: OutlineRenderOptions` — default: `{}`
**Returns:** `string`

## promote

### `extractPublicRows`
Every `@public`-tagged Examples block's first row (the tester's curated public example). Pure.
```ts
extractPublicRows(features: Feature[]): PublicExampleRow[]
```
**Parameters:**
- `features: Feature[]`
**Returns:** `PublicExampleRow[]`

### `buildExampleObject`
Build a concrete public example object from a row, coercing by the body schema's field types. A WIRING TOKEN cell
(`<op.select>`) is skipped — a public docs example holds concrete values, not a chaining instruction.
```ts
buildExampleObject(headers: string[], row: string[], bodySchema?: JsonSchema): Record<string, unknown>
```
**Parameters:**
- `headers: string[]`
- `row: string[]`
- `bodySchema: JsonSchema` (optional)
**Returns:** `Record<string, unknown>`

### `promoteExampleIntoZod`
Promote `example` into the source of the Zod schema bound to `const <schemaVar> = …`. Idempotent (re-promote replaces
the marked block), marked, and refuses to clobber a hand-authored top-level `.meta({ examples })`.
```ts
promoteExampleIntoZod(source: string, schemaVar: string, example: unknown, provenance: string): PromoteResult
```
**Parameters:**
- `source: string`
- `schemaVar: string`
- `example: unknown`
- `provenance: string`
**Returns:** `PromoteResult`

### `promoteFeatureExamples`
Orchestrate promotion for a whole feature set: for each `@public` Examples row, resolve its target (the consumer maps
scenario → schemaVar + body schema — the app knows that wiring), build the example, and apply it. Adapter-seam shaped.
```ts
promoteFeatureExamples(source: string, features: Feature[], resolveTarget: (scenario: string) => PromoteTarget | null, provenancePrefix: string): PromoteFeatureResult
```
**Parameters:**
- `source: string`
- `features: Feature[]`
- `resolveTarget: (scenario: string) => PromoteTarget | null`
- `provenancePrefix: string` — default: `"promoted from"`
**Returns:** `PromoteFeatureResult`

## bind

### `bindFeatures`
Bind a parsed feature set against the vocabulary (applying the scaffolder's definitions) and produce the gap report.
```ts
bindFeatures(vocab: Vocabulary, features: Feature[], opts: BindOptions): GapReport
```
**Parameters:**
- `vocab: Vocabulary`
- `features: Feature[]`
- `opts: BindOptions` — default: `{}`
**Returns:** `GapReport`

### `detectUndefined`
Detect every authored step that is not yet runnable — the scaffolder's worklist (Cucumber-style "undefined steps",
here resolved by MAPPING, not by writing code). It SUGGESTS a target when there is a lexical signal and otherwise
defers to the scaffolder; it never falsely claims a developer is required (absence of a word-match ≠ missing
capability). Reports against the ORIGINAL prose, deduped.
```ts
detectUndefined(vocab: Vocabulary, features: Feature[], opts: BindOptions): UndefinedStep[]
```
**Parameters:**
- `vocab: Vocabulary`
- `features: Feature[]`
- `opts: BindOptions` — default: `{}`
**Returns:** `UndefinedStep[]`

### `renderGapReport`
Render the gap report as readable text (for a CLI / a download endpoint).
```ts
renderGapReport(report: GapReport): string
```
**Parameters:**
- `report: GapReport`
**Returns:** `string`

### `renderScaffold`
Render the scaffolder worklist: what a non-technical author wrote that is not yet runnable, and how to resolve it.
```ts
renderScaffold(undefinedSteps: UndefinedStep[]): string
```
**Parameters:**
- `undefinedSteps: UndefinedStep[]`
**Returns:** `string`

## emit

### `emitRunnableSuite`
Emit a runnable bun:test suite (a string) from a parsed, bound feature set, lowered to the real SDK client.
```ts
emitRunnableSuite(doc: OpenAPIv4Document, vocab: Vocabulary, features: Feature[], opts: EmitOptions): string
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `vocab: Vocabulary`
- `features: Feature[]`
- `opts: EmitOptions` — default: `{}`
**Returns:** `string`

## demos

### `compileDemos`
Compile a bound feature set into the demo IR: ordered requests per scenario, with sourced fields wired to captures.
```ts
compileDemos(doc: OpenAPIv4Document, vocab: Vocabulary, features: Feature[], opts: CompileDemoOptions): DemoScenario[]
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `vocab: Vocabulary`
- `features: Feature[]`
- `opts: CompileDemoOptions` — default: `{}`
**Returns:** `DemoScenario[]`

### `renderPostman`
Render the demos as a Postman Collection v2.1.0 (a single JSON string).
```ts
renderPostman(demos: DemoScenario[], opts: RenderOptions): string
```
**Parameters:**
- `demos: DemoScenario[]`
- `opts: RenderOptions` — default: `{}`
**Returns:** `string`

### `renderBruno`
Render the demos as a Bruno collection — a map of relative file path → `.bru`/json content the consumer writes.
```ts
renderBruno(demos: DemoScenario[], opts: RenderOptions): Record<string, string>
```
**Parameters:**
- `demos: DemoScenario[]`
- `opts: RenderOptions` — default: `{}`
**Returns:** `Record<string, string>`

## cli

### `buildDemoFiles`
Pure: a v4 document text + `.feature` texts → the demo collection file map. No filesystem.
```ts
buildDemoFiles(docText: string, featureTexts: string[], opts: BuildDemoFilesOptions): DemoFilesResult
```
**Parameters:**
- `docText: string`
- `featureTexts: string[]`
- `opts: BuildDemoFilesOptions` — default: `{}`
**Returns:** `DemoFilesResult`

### `planPromotions`
Plan the promotions for every `@public` Examples row: build the public example (content-typed) and apply
`promoteExampleIntoZod` to the target's (pre-read) source — accumulating multiple rows per file. Pure: returns the
before/after source per file (the bin diffs + writes). The never-clobber refusals surface as skipped rows.
```ts
planPromotions(featureTexts: string[], targets: Map<string, PromoteTargetSpec>, sources: Record<string, string>, opts: { because?: string }): PromotionPlan
```
**Parameters:**
- `featureTexts: string[]`
- `targets: Map<string, PromoteTargetSpec>`
- `sources: Record<string, string>`
- `opts: { because?: string }` — default: `{}`
**Returns:** `PromotionPlan`

### `parseTargetSpec`
Parse `"<scenario>=<file>#<schemaVar>"`. The scenario may contain spaces/`=` only before the FIRST `=`.
```ts
parseTargetSpec(spec: string): { scenario: string; file: string; schemaVar: string } | null
```
**Parameters:**
- `spec: string`
**Returns:** `{ scenario: string; file: string; schemaVar: string } | null`

### `miniDiff`
A minimal context diff (the edit is localized to one schema statement). Lines: `  ` ctx, `- ` removed, `+ ` added.
```ts
miniDiff(oldText: string, newText: string, ctx: number): string
```
**Parameters:**
- `oldText: string`
- `newText: string`
- `ctx: number` — default: `2`
**Returns:** `string`

### `buildAudit`
Run all readiness dimensions over a contract (+ optional `.feature` texts) and fold them into one grade. Pure.
```ts
buildAudit(docText: string, featureTexts: string[]): AuditResult
```
**Parameters:**
- `docText: string`
- `featureTexts: string[]` — default: `[]`
**Returns:** `AuditResult`

## coverage

### `coverageGrade`
Grade a gap report's contract→authored coverage (covered/total) and surface the uncovered ops.
```ts
coverageGrade(report: GapReport): CoverageGrade
```
**Parameters:**
- `report: GapReport`
**Returns:** `CoverageGrade`

## `resolveExample`
Resolve a single example by precedence. `hint` (typically the field/op name) only steers SYNTHETIC string values; it
never changes which tier wins.
```ts
resolveExample(schema: JsonSchema | undefined, sources: ExampleSources, hint: string, opts: SynthOptions): ResolvedExample
```
**Parameters:**
- `schema: JsonSchema | undefined`
- `sources: ExampleSources` — default: `{}`
- `hint: string` — default: `"value"`
- `opts: SynthOptions` — default: `{}`
**Returns:** `ResolvedExample`

## `synthesize`
A deterministic, schema-shaped example value. `const`/`enum`/`default`/explicit `examples` win (so a synthesized
object's fields respect pinned values); otherwise a fixed representative is chosen per type. Object fields are
filtered by origin/direction (see SynthOptions). A `sourced` field IS synthesized (a type-valid representative) — the
wiring layer overrides it via describeInputs/resolveSourced; it is never laundered as free input.
```ts
synthesize(schema: JsonSchema, hint: string, opts: SynthOptions): unknown
```
**Parameters:**
- `schema: JsonSchema`
- `hint: string` — default: `"value"`
- `opts: SynthOptions` — default: `{}`
**Returns:** `unknown`

## `fieldOrigin`
Read a property's origin: explicit `x-suluk-origin` wins; else `readOnly` ⇒ `computed`; else default `input`.
```ts
fieldOrigin(schema: JsonSchema | undefined): FieldOrigin
```
**Parameters:**
- `schema: JsonSchema | undefined`
**Returns:** `FieldOrigin`

## `describeInputs`
Describe the TOP-LEVEL fields of an object schema by origin — the surface a client / the @suluk/sdk generator uses to
know what it may freely fill (`fakerable`), what is wired from elsewhere (`source`), and what is server-computed.
```ts
describeInputs(schema: JsonSchema | undefined): FieldDescriptor[]
```
**Parameters:**
- `schema: JsonSchema | undefined`
**Returns:** `FieldDescriptor[]`

## `asSourceRef`
The structured source edge if `x-suluk-from` names an `op`; otherwise undefined (a free note is not wireable).
```ts
asSourceRef(from: unknown): SourceRef | undefined
```
**Parameters:**
- `from: unknown`
**Returns:** `SourceRef | undefined`

## `resolveSourced`
Resolve a `sourced` field's value from a scenario-scoped bag of captured operation results (keyed by `op.name`). The
shared primitive both the journeys emitter (carried-data across a journey) and an sdk chaining helper use. Pure.
```ts
resolveSourced(captured: Record<string, unknown>, ref: SourceRef): unknown
```
**Parameters:**
- `captured: Record<string, unknown>`
- `ref: SourceRef`
**Returns:** `unknown`
