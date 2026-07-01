[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / queryD1

# Function: queryD1()

> **queryD1**(`cf`, `databaseId`, `sql`, `params?`): `Promise`\<`unknown`\>

Defined in: [tooling/ts/packages/cloudflare/src/resources.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/cloudflare/src/resources.ts#L23)

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
