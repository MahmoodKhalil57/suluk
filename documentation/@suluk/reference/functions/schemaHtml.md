[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/reference](../README.md) / schemaHtml

# Function: schemaHtml()

> **schemaHtml**(`doc`, `schema`, `depth?`, `seen?`): `string`

Defined in: [reference/src/schema.ts:49](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/reference/src/schema.ts#L49)

Render a schema compactly. `depth`/`seen` guard against $ref cycles + runaway nesting.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### schema

`unknown`

### depth?

`number` = `0`

### seen?

`Set`\<`string`\> = `...`

## Returns

`string`
