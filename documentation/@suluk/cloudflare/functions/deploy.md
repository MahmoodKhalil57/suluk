[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / deploy

# Function: deploy()

> **deploy**(`cf`, `plan`, `log?`): `Promise`\<[`DeployResult`](../interfaces/DeployResult.md)\>

Defined in: [tooling/ts/packages/cloudflare/src/deploy.ts:118](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cloudflare/src/deploy.ts#L118)

Orchestrate a full deploy over a client + plan. `log` narrates each step.

## Parameters

### cf

[`CloudflareClient`](../classes/CloudflareClient.md)

### plan

[`DeployPlan`](../interfaces/DeployPlan.md)

### log?

[`DeployLog`](../type-aliases/DeployLog.md) = `...`

## Returns

`Promise`\<[`DeployResult`](../interfaces/DeployResult.md)\>
