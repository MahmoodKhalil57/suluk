[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/admin](../README.md) / renderEntityAdmin

# Function: renderEntityAdmin()

> **renderEntityAdmin**(`doc`, `name`, `base`, `_rows?`): `string`

Defined in: [render-data.ts:137](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/admin/src/render-data.ts#L137)

One entity's data-admin page — a FULLY FUNCTIONAL CRUD UI (saastarter's Payload admin, projected): a live list
table (loaded from the entity's CRUD endpoint), a create/edit form, and per-row Edit + Delete — all driven by
inline vanilla JS hitting the same admin-gated CRUD routes the contract already serves, so the admin can never
drift from the schema AND actually writes. `id`/server-managed fields are read-only on create.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### name

`string`

### base

`string`

### \_rows?

`Record`\<`string`, `unknown`\>[] = `[]`

## Returns

`string`
