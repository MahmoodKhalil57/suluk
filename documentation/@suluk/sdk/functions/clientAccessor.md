[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/sdk](../README.md) / clientAccessor

# Function: clientAccessor()

> **clientAccessor**(`op`): `string`

Defined in: [generate.ts:126](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/sdk/src/generate.ts#L126)

The client accessor for an op — the dotted path AFTER `client.` (e.g. `paymentMethods.list`). Matches emitTree's
 by-last-namespace-segment grouping, so `createStores` calls EXACTLY the method `generateSdk` emitted.

## Parameters

### op

[`OpInfo`](../interfaces/OpInfo.md)

## Returns

`string`
