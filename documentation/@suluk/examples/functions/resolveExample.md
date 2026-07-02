[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/examples](../README.md) / resolveExample

# Function: resolveExample()

> **resolveExample**(`schema`, `sources?`, `hint?`, `opts?`): [`ResolvedExample`](../interfaces/ResolvedExample.md)

Defined in: [index.ts:143](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/examples/src/index.ts#L143)

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
