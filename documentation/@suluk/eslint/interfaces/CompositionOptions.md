[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/eslint](../README.md) / CompositionOptions

# Interface: CompositionOptions

Defined in: [analyze.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/eslint/src/analyze.ts#L15)

## Properties

### allowGetStaticPaths?

> `optional` **allowGetStaticPaths?**: `boolean`

Defined in: [analyze.ts:21](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/eslint/src/analyze.ts#L21)

Treat Astro's page-bound `getStaticPaths` as allowed page-level logic, exempt from the frontmatter budget (default true).

***

### budgets?

> `optional` **budgets?**: `Partial`\<`Record`\<[`Metric`](../type-aliases/Metric.md), `number`\>\>

Defined in: [analyze.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/eslint/src/analyze.ts#L17)

Max allowed count per metric before it's a violation (default 0 — pure composition).

***

### ignoreTags?

> `optional` **ignoreTags?**: `string`[]

Defined in: [analyze.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/eslint/src/analyze.ts#L19)

Lowercase tag names NOT counted as native HTML (framework/control elements).
