[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / tableToV4

# Function: tableToV4()

> **tableToV4**(`table`): [`TableV4Schemas`](../interfaces/TableV4Schemas.md)

Defined in: [schemas.ts:48](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/drizzle/src/schemas.ts#L48)

Lift a table's three Zod schemas to v4 Schema Objects via zodToV4. drizzle-zod produces plain object
schemas (no .transform/.refine), so this is lossless here — but we still honor the house rule and surface
any zodToV4 warnings rather than dropping them silently (see [tableToV4Warnings](tableToV4Warnings.md)).

## Parameters

### table

`Table`

## Returns

[`TableV4Schemas`](../interfaces/TableV4Schemas.md)
