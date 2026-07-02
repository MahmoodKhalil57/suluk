[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/models](../README.md) / applyTierOverlay

# Function: applyTierOverlay()

> **applyTierOverlay**(`catalog`, `tiers`, `opts`): [`ModelCatalog`](../interfaces/ModelCatalog.md)

Defined in: [overlay.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/models/src/overlay.ts#L14)

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
