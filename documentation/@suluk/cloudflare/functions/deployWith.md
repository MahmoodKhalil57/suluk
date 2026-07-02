[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / deployWith

# Function: deployWith()

> **deployWith**(`opts`, `plan`, `log?`): `Promise`\<[`DeployResult`](../interfaces/DeployResult.md)\>

Defined in: [tooling/ts/packages/cloudflare/src/deploy.ts:206](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/cloudflare/src/deploy.ts#L206)

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
