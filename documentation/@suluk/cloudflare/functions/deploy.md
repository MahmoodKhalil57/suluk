[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / deploy

# Function: deploy()

> **deploy**(`cf`, `plan`, `log?`): `Promise`\<[`DeployResult`](../interfaces/DeployResult.md)\>

Defined in: [tooling/ts/packages/cloudflare/src/deploy.ts:118](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/cloudflare/src/deploy.ts#L118)

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
