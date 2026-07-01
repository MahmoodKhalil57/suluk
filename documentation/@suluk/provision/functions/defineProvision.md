[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / defineProvision

# Function: defineProvision()

> **defineProvision**(`config`): [`ProvisionConfig`](../interfaces/ProvisionConfig.md)

Defined in: [provision/src/config.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/provision/src/config.ts#L20)

Validate + return a provision config. Throws on a duplicate ref, an undeclared-ref reference, or a binding cycle
 (via [topoOrder](topoOrder.md)) — all the static errors, surfaced before `apply` touches a provider.

## Parameters

### config

[`ProvisionConfig`](../interfaces/ProvisionConfig.md)

## Returns

[`ProvisionConfig`](../interfaces/ProvisionConfig.md)
