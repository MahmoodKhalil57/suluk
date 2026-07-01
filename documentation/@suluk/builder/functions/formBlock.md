[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / formBlock

# Function: formBlock()

> **formBlock**(`entity`, `defs?`): [`DslDocument`](../interfaces/DslDocument.md)

Defined in: [fullstack.ts:49](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/builder/src/fullstack.ts#L49)

A Form block for an entity. Its contract (`params`) exposes only tone + which fields — the field SET is fixed.

## Parameters

### entity

[`Entity`](../interfaces/Entity.md)

### defs?

`Record`\<`string`, [`SchemaOrRef`](../../core/type-aliases/SchemaOrRef.md)\>

## Returns

[`DslDocument`](../interfaces/DslDocument.md)
