[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / resolveExample

# Function: resolveExample()

> **resolveExample**(`schema`, `sources?`, `hint?`, `opts?`): [`ResolvedExample`](../interfaces/ResolvedExample.md)

Defined in: [examples/src/index.ts:143](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/examples/src/index.ts#L143)

Resolve a single example by precedence. `hint` (typically the field/op name) only steers SYNTHETIC string values; it
never changes which tier wins.

## Parameters

### schema

[`JsonSchema`](../type-aliases/JsonSchema.md) \| `undefined`

### sources?

[`ExampleSources`](../interfaces/ExampleSources.md) = `{}`

### hint?

`string` = `"value"`

### opts?

[`SynthOptions`](../interfaces/SynthOptions.md) = `{}`

## Returns

[`ResolvedExample`](../interfaces/ResolvedExample.md)
