[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / ProvisionConfig

# Interface: ProvisionConfig

Defined in: [provision/src/config.ts:10](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/provision/src/config.ts#L10)

## Properties

### instances

> **instances**: [`InstanceSpec`](InstanceSpec.md)[]

Defined in: [provision/src/config.ts:12](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/provision/src/config.ts#L12)

the instances to provision (desired state). Order is free — the binding DAG decides apply order.

***

### pruneOrphans?

> `optional` **pruneOrphans?**: `boolean`

Defined in: [provision/src/config.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/provision/src/config.ts#L15)

orphan mitigation default: deprovision instances in state but not in config. DEFAULT false (destructive — opt in
 here or per-apply). `apply --prune` / `check` honour it.
