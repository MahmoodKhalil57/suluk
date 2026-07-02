[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/reference](../README.md) / schemaHtml

# Function: schemaHtml()

> **schemaHtml**(`doc`, `schema`, `depth?`, `seen?`): `string`

Defined in: [reference/src/schema.ts:49](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/reference/src/schema.ts#L49)

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
