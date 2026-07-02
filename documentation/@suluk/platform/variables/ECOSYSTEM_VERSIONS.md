[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / ECOSYSTEM\_VERSIONS

# Variable: ECOSYSTEM\_VERSIONS

> `const` **ECOSYSTEM\_VERSIONS**: `Record`\<`string`, `string`\>

Defined in: [catalog.ts:33](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/catalog.ts#L33)

Pinned ranges for the NON-@suluk ecosystem deps — the single place they're kept current for every generated app.
 `@suluk/*` are NOT here: they resolve to "latest" so a package fix flows to the app via `bun update` (the C052 payoff).
