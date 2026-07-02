[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / putCronTriggers

# Function: putCronTriggers()

> **putCronTriggers**(`cf`, `scriptName`, `crons`): `Promise`\<`void`\>

Defined in: [tooling/ts/packages/cloudflare/src/worker.ts:84](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cloudflare/src/worker.ts#L84)

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
