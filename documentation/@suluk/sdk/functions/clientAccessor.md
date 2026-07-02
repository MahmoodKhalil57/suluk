[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/sdk](../README.md) / clientAccessor

# Function: clientAccessor()

> **clientAccessor**(`op`): `string`

Defined in: [generate.ts:126](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/sdk/src/generate.ts#L126)

The client accessor for an op — the dotted path AFTER `client.` (e.g. `paymentMethods.list`). Matches emitTree's
 by-last-namespace-segment grouping, so `createStores` calls EXACTLY the method `generateSdk` emitted.

## Parameters

### op

[`OpInfo`](../interfaces/OpInfo.md)

## Returns

`string`
