[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/models](../README.md) / fetchOpenRouterCatalog

# Function: fetchOpenRouterCatalog()

> **fetchOpenRouterCatalog**(`asOf`, `opts?`): `Promise`\<[`ModelCatalog`](../interfaces/ModelCatalog.md)\>

Defined in: [fetch.ts:12](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/models/src/fetch.ts#L12)

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
