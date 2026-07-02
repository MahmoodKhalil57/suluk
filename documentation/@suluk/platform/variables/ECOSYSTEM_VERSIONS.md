[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / ECOSYSTEM\_VERSIONS

# Variable: ECOSYSTEM\_VERSIONS

> `const` **ECOSYSTEM\_VERSIONS**: `Record`\<`string`, `string`\>

Defined in: [catalog.ts:33](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/platform/src/catalog.ts#L33)

Pinned ranges for the NON-@suluk ecosystem deps — the single place they're kept current for every generated app.
 `@suluk/*` are NOT here: they resolve to "latest" so a package fix flows to the app via `bun update` (the C052 payoff).
