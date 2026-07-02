[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/models](../README.md) / applyTierOverlay

# Function: applyTierOverlay()

> **applyTierOverlay**(`catalog`, `tiers`, `opts`): [`ModelCatalog`](../interfaces/ModelCatalog.md)

Defined in: [overlay.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/models/src/overlay.ts#L14)

Overlay coarse tiers onto matching rows' intel cells, then re-hash (selection now depends on these tiers).

## Parameters

### catalog

[`ModelCatalog`](../interfaces/ModelCatalog.md)

### tiers

`Record`\<`string`, `Partial`\<`Record`\<[`IntelAxis`](../type-aliases/IntelAxis.md), [`Tier`](../type-aliases/Tier.md)\>\>\>

### opts

#### asOf

`string`

#### source

`string`

## Returns

[`ModelCatalog`](../interfaces/ModelCatalog.md)
