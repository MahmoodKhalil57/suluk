[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / tableMetadata

# Function: tableMetadata()

> **tableMetadata**(`table`): [`TableMeta`](../interfaces/TableMeta.md)

Defined in: [meta.ts:54](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/drizzle/src/meta.ts#L54)

Read a drizzle table's metadata. This is the honest floor: every value comes from the column descriptor,
nothing is inferred. `enumValues` is only present when the underlying column actually carries one — we
don't synthesize an empty array (that would be a silent invention).

## Parameters

### table

`Table`

## Returns

[`TableMeta`](../interfaces/TableMeta.md)
