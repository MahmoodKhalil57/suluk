[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / tableMetadata

# Function: tableMetadata()

> **tableMetadata**(`table`): [`TableMeta`](../interfaces/TableMeta.md)

Defined in: [meta.ts:54](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/drizzle/src/meta.ts#L54)

Read a drizzle table's metadata. This is the honest floor: every value comes from the column descriptor,
nothing is inferred. `enumValues` is only present when the underlying column actually carries one — we
don't synthesize an empty array (that would be a silent invention).

## Parameters

### table

`Table`

## Returns

[`TableMeta`](../interfaces/TableMeta.md)
