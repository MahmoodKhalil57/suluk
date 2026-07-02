[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / toCatalogEntry

# Function: toCatalogEntry()

> **toCatalogEntry**(`s`): [`CatalogEntry`](../interfaces/CatalogEntry.md)

Defined in: [service.ts:161](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/platform/src/service.ts#L161)

Project a Service onto the legacy [CatalogEntry](../interfaces/CatalogEntry.md) shape the C051 generator reads. Field-for-field — so a derived
 CATALOG is behaviourally identical to the old hardcoded one (proven by the Phase-0 golden lock).

## Parameters

### s

[`Service`](../interfaces/Service.md)

## Returns

[`CatalogEntry`](../interfaces/CatalogEntry.md)
