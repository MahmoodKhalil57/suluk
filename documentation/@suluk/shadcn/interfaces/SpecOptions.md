[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/shadcn](../README.md) / SpecOptions

# Interface: SpecOptions

Defined in: [spec.ts:69](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/shadcn/src/spec.ts#L69)

`@suluk/shadcn` — the UI corner. v4 "Suluk" Schema Objects → shadcn/ui form + table specs and TSX scaffolds.

The chain is: Zod → v4 Schema Object (@suluk/zod) → descriptor model (formSpec/tableSpec, here) → shadcn TSX
(renderFormTsx/renderTableTsx, here). This package is CODEGEN ONLY — no runtime UI deps; it emits component
source as strings against the conventional shadcn/ui import paths (react-hook-form + zodResolver for forms).

Honest-loss discipline (house pattern): the descriptor specs carry a `warnings: string[]` channel for every
property we could not faithfully map (unresolvable $ref, boolean schemas, non-object roots), and the
renderers surface those warnings as a leading comment block. Nothing is dropped silently. CANDIDATE tooling.

## Properties

### defs?

> `optional` **defs?**: `Record`\<`string`, [`SchemaOrRef`](../../core/type-aliases/SchemaOrRef.md)\>

Defined in: [spec.ts:71](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/shadcn/src/spec.ts#L71)

A `$defs`/components map so a top-level or property-level Reference can be resolved by name.
