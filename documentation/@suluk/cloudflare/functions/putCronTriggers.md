[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / putCronTriggers

# Function: putCronTriggers()

> **putCronTriggers**(`cf`, `scriptName`, `crons`): `Promise`\<`void`\>

Defined in: [tooling/ts/packages/cloudflare/src/worker.ts:84](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/cloudflare/src/worker.ts#L84)

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
