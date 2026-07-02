[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/admin](../README.md) / renderEntityAdmin

# Function: renderEntityAdmin()

> **renderEntityAdmin**(`doc`, `name`, `base`, `_rows?`): `string`

Defined in: [render-data.ts:137](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/admin/src/render-data.ts#L137)

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
