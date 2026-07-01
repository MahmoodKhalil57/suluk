[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/panel](../README.md) / fieldsOf

# Function: fieldsOf()

> **fieldsOf**(`schema`, `entities?`, `opts?`): [`Field`](../interfaces/Field.md)[]

Defined in: [fields.ts:82](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/panel/src/fields.ts#L82)

Infer the ordered field set for an entity. `entities` is the set of entity names (for relationship detection).

## Parameters

### schema

`Schema`

### entities?

`Set`\<`string`\> = `...`

### opts?

[`FieldsOptions`](../interfaces/FieldsOptions.md) = `{}`

## Returns

[`Field`](../interfaces/Field.md)[]
