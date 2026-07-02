[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/deploy](../README.md) / entityColumns

# Function: entityColumns()

> **entityColumns**(`entity`): [`ColumnDef`](../interfaces/ColumnDef.md)[]

Defined in: [sql.ts:36](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/deploy/src/sql.ts#L36)

The columns of an entity, in DDL order (id is a synthesized autoincrement PK when absent). [] for a $ref/boolean.

## Parameters

### entity

[`DeployEntity`](../interfaces/DeployEntity.md)

## Returns

[`ColumnDef`](../interfaces/ColumnDef.md)[]
