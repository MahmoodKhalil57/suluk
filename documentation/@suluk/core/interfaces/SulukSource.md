[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / SulukSource

# Interface: SulukSource

Defined in: [types.ts:443](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/core/src/types.ts#L443)

A stable, symbolic pointer back to the authored source an element was projected from (advisory provenance).

## Properties

### file

> **file**: `string`

Defined in: [types.ts:445](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/core/src/types.ts#L445)

repo-relative path to the authoring file (e.g. "src/server/schema.ts"). NOT a line number.

***

### kind?

> `optional` **kind?**: `string`

Defined in: [types.ts:449](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/core/src/types.ts#L449)

what kind of authored thing it is — "drizzle-table" | "operation" | "better-auth" | … (advisory label).

***

### symbol

> **symbol**: `string`

Defined in: [types.ts:447](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/core/src/types.ts#L447)

the exported symbol within that file (e.g. a Drizzle table export, or the operation's name).
