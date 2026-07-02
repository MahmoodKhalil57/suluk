[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/panel](../README.md) / Field

# Interface: Field

Defined in: [fields.ts:12](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/panel/src/fields.ts#L12)

`@suluk/panel` — contract-first admin panels, in the spirit of Payload but projected from ONE OpenAPI v4 document.
Payload makes you configure collections in a framework-coupled DSL; @suluk/panel INFERS the same field types
(text/textarea/richtext/number/boolean/select/date/email/url/json/relationship) straight from the contract's
component schemas, renders shadcn/theme-aware forms + data tables, and mounts a role-aware admin — pass a
per-role PROJECTED document and you get a per-role dashboard for free. No DB coupling (it drives the contract's
REST), no config drift (the contract is the single source). CANDIDATE tooling.

## Properties

### description?

> `optional` **description?**: `string`

Defined in: [fields.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/panel/src/fields.ts#L19)

***

### label

> **label**: `string`

Defined in: [fields.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/panel/src/fields.ts#L14)

***

### name

> **name**: `string`

Defined in: [fields.ts:13](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/panel/src/fields.ts#L13)

***

### nullable

> **nullable**: `boolean`

Defined in: [fields.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/panel/src/fields.ts#L17)

***

### options?

> `optional` **options?**: `string`[]

Defined in: [fields.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/panel/src/fields.ts#L20)

***

### optionType?

> `optional` **optionType?**: `"string"` \| `"number"` \| `"boolean"`

Defined in: [fields.ts:21](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/panel/src/fields.ts#L21)

***

### readOnly

> **readOnly**: `boolean`

Defined in: [fields.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/panel/src/fields.ts#L18)

***

### relationLabelField?

> `optional` **relationLabelField?**: `string`

Defined in: [fields.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/panel/src/fields.ts#L23)

***

### relationTo?

> `optional` **relationTo?**: `string`

Defined in: [fields.ts:22](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/panel/src/fields.ts#L22)

***

### required

> **required**: `boolean`

Defined in: [fields.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/panel/src/fields.ts#L16)

***

### type

> **type**: [`FieldType`](../type-aliases/FieldType.md)

Defined in: [fields.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/panel/src/fields.ts#L15)
