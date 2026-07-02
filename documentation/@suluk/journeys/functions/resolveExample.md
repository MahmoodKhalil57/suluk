[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / resolveExample

# Function: resolveExample()

> **resolveExample**(`schema`, `sources?`, `hint?`, `opts?`): [`ResolvedExample`](../interfaces/ResolvedExample.md)

Defined in: [examples/src/index.ts:143](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/examples/src/index.ts#L143)

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
