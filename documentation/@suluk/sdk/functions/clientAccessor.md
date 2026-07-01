[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/sdk](../README.md) / clientAccessor

# Function: clientAccessor()

> **clientAccessor**(`op`): `string`

Defined in: [generate.ts:126](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/sdk/src/generate.ts#L126)

The client accessor for an op — the dotted path AFTER `client.` (e.g. `paymentMethods.list`). Matches emitTree's
 by-last-namespace-segment grouping, so `createStores` calls EXACTLY the method `generateSdk` emitted.

## Parameters

### op

[`OpInfo`](../interfaces/OpInfo.md)

## Returns

`string`
