[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/eslint](../README.md) / CompositionOptions

# Interface: CompositionOptions

Defined in: analyze.ts:15

## Properties

### allowGetStaticPaths?

> `optional` **allowGetStaticPaths?**: `boolean`

Defined in: analyze.ts:21

Treat Astro's page-bound `getStaticPaths` as allowed page-level logic, exempt from the frontmatter budget (default true).

***

### budgets?

> `optional` **budgets?**: `Partial`\<`Record`\<[`Metric`](../type-aliases/Metric.md), `number`\>\>

Defined in: analyze.ts:17

Max allowed count per metric before it's a violation (default 0 — pure composition).

***

### ignoreTags?

> `optional` **ignoreTags?**: `string`[]

Defined in: analyze.ts:19

Lowercase tag names NOT counted as native HTML (framework/control elements).
