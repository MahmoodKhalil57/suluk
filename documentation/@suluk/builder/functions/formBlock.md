[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / formBlock

# Function: formBlock()

> **formBlock**(`entity`, `defs?`): [`DslDocument`](../interfaces/DslDocument.md)

Defined in: [fullstack.ts:49](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/builder/src/fullstack.ts#L49)

A Form block for an entity. Its contract (`params`) exposes only tone + which fields — the field SET is fixed.

## Parameters

### entity

[`Entity`](../interfaces/Entity.md)

### defs?

`Record`\<`string`, [`SchemaOrRef`](../../core/type-aliases/SchemaOrRef.md)\>

## Returns

[`DslDocument`](../interfaces/DslDocument.md)
