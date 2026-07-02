[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / synthesize

# Function: synthesize()

> **synthesize**(`schema`, `hint?`, `opts?`): `unknown`

Defined in: [examples/src/index.ts:244](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/examples/src/index.ts#L244)

A deterministic, schema-shaped example value. `const`/`enum`/`default`/explicit `examples` win (so a synthesized
object's fields respect pinned values); otherwise a fixed representative is chosen per type. Object fields are
filtered by origin/direction (see SynthOptions). A `sourced` field IS synthesized (a type-valid representative) — the
wiring layer overrides it via describeInputs/resolveSourced; it is never laundered as free input.

## Parameters

### schema

[`JsonSchema`](../type-aliases/JsonSchema.md)

### hint?

`string` = `"value"`

### opts?

[`SynthOptions`](../interfaces/SynthOptions.md) = `{}`

## Returns

`unknown`
