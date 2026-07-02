[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/examples](../README.md) / synthesize

# Function: synthesize()

> **synthesize**(`schema`, `hint?`, `opts?`): `unknown`

Defined in: [index.ts:244](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/examples/src/index.ts#L244)

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
