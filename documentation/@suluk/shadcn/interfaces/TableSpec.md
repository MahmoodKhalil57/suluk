[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/shadcn](../README.md) / TableSpec

# Interface: TableSpec

Defined in: [spec.ts:64](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/shadcn/src/spec.ts#L64)

`@suluk/shadcn` — the UI corner. v4 "Suluk" Schema Objects → shadcn/ui form + table specs and TSX scaffolds.

The chain is: Zod → v4 Schema Object (@suluk/zod) → descriptor model (formSpec/tableSpec, here) → shadcn TSX
(renderFormTsx/renderTableTsx, here). This package is CODEGEN ONLY — no runtime UI deps; it emits component
source as strings against the conventional shadcn/ui import paths (react-hook-form + zodResolver for forms).

Honest-loss discipline (house pattern): the descriptor specs carry a `warnings: string[]` channel for every
property we could not faithfully map (unresolvable $ref, boolean schemas, non-object roots), and the
renderers surface those warnings as a leading comment block. Nothing is dropped silently. CANDIDATE tooling.

## Properties

### columns

> **columns**: [`ColumnSpec`](ColumnSpec.md)[]

Defined in: [spec.ts:65](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/shadcn/src/spec.ts#L65)

***

### warnings

> **warnings**: `string`[]

Defined in: [spec.ts:66](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/shadcn/src/spec.ts#L66)
