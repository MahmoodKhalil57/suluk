[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / deployWith

# Function: deployWith()

> **deployWith**(`opts`, `plan`, `log?`): `Promise`\<[`DeployResult`](../interfaces/DeployResult.md)\>

Defined in: [tooling/ts/packages/cloudflare/src/deploy.ts:206](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/cloudflare/src/deploy.ts#L206)

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
