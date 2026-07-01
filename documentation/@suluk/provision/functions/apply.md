[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / apply

# Function: apply()

> **apply**(`config`, `opts`): `Promise`\<[`ApplyResult`](../interfaces/ApplyResult.md)\>

Defined in: [provision/src/apply.ts:61](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/provision/src/apply.ts#L61)

Execute the plan for `config`. Idempotent end-to-end: re-running a settled config is all-noops, touches no provider.

## Parameters

### config

[`ProvisionConfig`](../interfaces/ProvisionConfig.md)

### opts

[`ApplyOptions`](../interfaces/ApplyOptions.md)

## Returns

`Promise`\<[`ApplyResult`](../interfaces/ApplyResult.md)\>
