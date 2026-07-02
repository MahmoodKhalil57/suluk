[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/sdk](../README.md) / clientAccessor

# Function: clientAccessor()

> **clientAccessor**(`op`): `string`

Defined in: [generate.ts:126](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/sdk/src/generate.ts#L126)

The client accessor for an op — the dotted path AFTER `client.` (e.g. `paymentMethods.list`). Matches emitTree's
 by-last-namespace-segment grouping, so `createStores` calls EXACTLY the method `generateSdk` emitted.

## Parameters

### op

[`OpInfo`](../interfaces/OpInfo.md)

## Returns

`string`
