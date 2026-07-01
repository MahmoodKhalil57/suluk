[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / putCronTriggers

# Function: putCronTriggers()

> **putCronTriggers**(`cf`, `scriptName`, `crons`): `Promise`\<`void`\>

Defined in: [tooling/ts/packages/cloudflare/src/worker.ts:84](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/cloudflare/src/worker.ts#L84)

Set the cron triggers for a script (separate endpoint — metadata doesn't carry them).

## Parameters

### cf

[`CloudflareClient`](../classes/CloudflareClient.md)

### scriptName

`string`

### crons

`string`[]

## Returns

`Promise`\<`void`\>
