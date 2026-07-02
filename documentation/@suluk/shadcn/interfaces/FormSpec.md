[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/shadcn](../README.md) / FormSpec

# Interface: FormSpec

Defined in: [spec.ts:48](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/shadcn/src/spec.ts#L48)

`@suluk/shadcn` — the UI corner. v4 "Suluk" Schema Objects → shadcn/ui form + table specs and TSX scaffolds.

The chain is: Zod → v4 Schema Object (@suluk/zod) → descriptor model (formSpec/tableSpec, here) → shadcn TSX
(renderFormTsx/renderTableTsx, here). This package is CODEGEN ONLY — no runtime UI deps; it emits component
source as strings against the conventional shadcn/ui import paths (react-hook-form + zodResolver for forms).

Honest-loss discipline (house pattern): the descriptor specs carry a `warnings: string[]` channel for every
property we could not faithfully map (unresolvable $ref, boolean schemas, non-object roots), and the
renderers surface those warnings as a leading comment block. Nothing is dropped silently. CANDIDATE tooling.

## Properties

### fields

> **fields**: [`FieldSpec`](FieldSpec.md)[]

Defined in: [spec.ts:49](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/shadcn/src/spec.ts#L49)

***

### warnings

> **warnings**: `string`[]

Defined in: [spec.ts:51](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/shadcn/src/spec.ts#L51)

Properties we could not faithfully map (enumerated; never dropped silently).
