[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / ProvisionConfig

# Interface: ProvisionConfig

Defined in: [provision/src/config.ts:10](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/provision/src/config.ts#L10)

## Properties

### instances

> **instances**: [`InstanceSpec`](InstanceSpec.md)[]

Defined in: [provision/src/config.ts:12](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/provision/src/config.ts#L12)

the instances to provision (desired state). Order is free — the binding DAG decides apply order.

***

### pruneOrphans?

> `optional` **pruneOrphans?**: `boolean`

Defined in: [provision/src/config.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/provision/src/config.ts#L15)

orphan mitigation default: deprovision instances in state but not in config. DEFAULT false (destructive — opt in
 here or per-apply). `apply --prune` / `check` honour it.
