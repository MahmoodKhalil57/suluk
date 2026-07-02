# Functions

## `fieldOrigin`
Read a property's origin: explicit `x-suluk-origin` wins; else `readOnly` ⇒ `computed`; else default `input`.
```ts
fieldOrigin(schema: JsonSchema | undefined): FieldOrigin
```
**Parameters:**
- `schema: JsonSchema | undefined`
**Returns:** `FieldOrigin`

## `asSourceRef`
The structured source edge if `x-suluk-from` names an `op`; otherwise undefined (a free note is not wireable).
```ts
asSourceRef(from: unknown): SourceRef | undefined
```
**Parameters:**
- `from: unknown`
**Returns:** `SourceRef | undefined`

## `describeInputs`
Describe the TOP-LEVEL fields of an object schema by origin — the surface a client / the @suluk/sdk generator uses to
know what it may freely fill (`fakerable`), what is wired from elsewhere (`source`), and what is server-computed.
```ts
describeInputs(schema: JsonSchema | undefined): FieldDescriptor[]
```
**Parameters:**
- `schema: JsonSchema | undefined`
**Returns:** `FieldDescriptor[]`

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
