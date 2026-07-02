[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / queryD1

# Function: queryD1()

> **queryD1**(`cf`, `databaseId`, `sql`, `params?`): `Promise`\<`unknown`\>

Defined in: [tooling/ts/packages/cloudflare/src/resources.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/cloudflare/src/resources.ts#L23)

Run SQL against a D1 database (D1 accepts multiple `;`-separated statements per call). `params` are bound via the
 D1 /query `params` array — ALWAYS pass values as params (never string-interpolate user/test data into `sql`).

## Parameters

### cf

[`CloudflareClient`](../classes/CloudflareClient.md)

### databaseId

`string`

### sql

`string`

### params?

`unknown`[]

## Returns

`Promise`\<`unknown`\>
