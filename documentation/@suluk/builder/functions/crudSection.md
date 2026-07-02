[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / crudSection

# Function: crudSection()

> **crudSection**(`entity`): [`DslDocument`](../interfaces/DslDocument.md)

Defined in: [fullstack.ts:73](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/builder/src/fullstack.ts#L73)

A CRUD section composing the entity's Table + Form blocks. It HARDCODES the block field/column details and
re-publishes only { tone, blocks } upward — so a page may reorder/hide the two blocks and set tone, but can
NOT reach into the form's fields. The narrowing is the section's contract.

## Parameters

### entity

[`Entity`](../interfaces/Entity.md)

## Returns

[`DslDocument`](../interfaces/DslDocument.md)
