[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/docs](../README.md) / rewriteRepoLinks

# Function: rewriteRepoLinks()

> **rewriteRepoLinks**(`md`, `repoUrl`, `relDir`, `ref?`): `string`

Defined in: [md.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/docs/src/md.ts#L18)

Rewrite repo-RELATIVE markdown links (`](../../doc/x.md)`, `](./y)`) to absolute GitHub blob URLs so a
README harvested into the site doesn't ship dead links. `relDir` is the package's path from the repo root
(e.g. `tooling/ts/packages/core`); the link is resolved against it and normalized. Absolute links
(`http(s):`, `mailto:`, protocol-relative), pure `#anchors`, and already-absolute paths are left untouched.

## Parameters

### md

`string`

### repoUrl

`string`

### relDir

`string`

### ref?

`string` = `"main"`

## Returns

`string`
