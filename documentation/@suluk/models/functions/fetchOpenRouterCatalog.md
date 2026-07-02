[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/models](../README.md) / fetchOpenRouterCatalog

# Function: fetchOpenRouterCatalog()

> **fetchOpenRouterCatalog**(`asOf`, `opts?`): `Promise`\<[`ModelCatalog`](../interfaces/ModelCatalog.md)\>

Defined in: [fetch.ts:12](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/models/src/fetch.ts#L12)

Fetch OpenRouter `/models` and normalize to the fact-cell catalog. NETWORK — run from a weekly script/CI, not tests.

## Parameters

### asOf

`string`

### opts?

#### baseUrl?

`string`

#### fetchImpl?

*typeof* `fetch`

## Returns

`Promise`\<[`ModelCatalog`](../interfaces/ModelCatalog.md)\>
