[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / toCatalogEntry

# Function: toCatalogEntry()

> **toCatalogEntry**(`s`): [`CatalogEntry`](../interfaces/CatalogEntry.md)

Defined in: [service.ts:165](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/service.ts#L165)

Project a Service onto the legacy [CatalogEntry](../interfaces/CatalogEntry.md) shape the C051 generator reads. Field-for-field — so a derived
 CATALOG is behaviourally identical to the old hardcoded one (proven by the Phase-0 golden lock).

## Parameters

### s

[`Service`](../interfaces/Service.md)

## Returns

[`CatalogEntry`](../interfaces/CatalogEntry.md)
