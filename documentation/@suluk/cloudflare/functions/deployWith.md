[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / deployWith

# Function: deployWith()

> **deployWith**(`opts`, `plan`, `log?`): `Promise`\<[`DeployResult`](../interfaces/DeployResult.md)\>

Defined in: [tooling/ts/packages/cloudflare/src/deploy.ts:206](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/cloudflare/src/deploy.ts#L206)

Convenience: build a client from token/account options and run a deploy.

## Parameters

### opts

[`CloudflareClientOptions`](../interfaces/CloudflareClientOptions.md)

### plan

[`DeployPlan`](../interfaces/DeployPlan.md)

### log?

[`DeployLog`](../type-aliases/DeployLog.md)

## Returns

`Promise`\<[`DeployResult`](../interfaces/DeployResult.md)\>
