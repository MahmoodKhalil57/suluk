[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/panel](../README.md) / fieldsOf

# Function: fieldsOf()

> **fieldsOf**(`schema`, `entities?`, `opts?`): [`Field`](../interfaces/Field.md)[]

Defined in: [fields.ts:82](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/panel/src/fields.ts#L82)

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
