[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/docs](../README.md) / PackageDoc

# Interface: PackageDoc

Defined in: [harvest.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/docs/src/harvest.ts#L15)

`@suluk/docs` — generate an intuitive static documentation site for a Bun/TS monorepo, straight from source
(package.json + the leading doc-comments + exports + ARCHITECTURE/README). The output is plain HTML + one
stylesheet, deployable to GitHub Pages with zero build. Suluk documents itself with it. CANDIDATE tooling.

## Properties

### dependencies

> **dependencies**: `string`[]

Defined in: [harvest.ts:21](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/docs/src/harvest.ts#L21)

***

### description

> **description**: `string`

Defined in: [harvest.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/docs/src/harvest.ts#L18)

***

### exports

> **exports**: `string`[]

Defined in: [harvest.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/docs/src/harvest.ts#L30)

Public symbols re-exported from the barrel.

***

### modules

> **modules**: [`ModuleDoc`](ModuleDoc.md)[]

Defined in: [harvest.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/docs/src/harvest.ts#L32)

Per-module leading doc-comments.

***

### name

> **name**: `string`

Defined in: [harvest.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/docs/src/harvest.ts#L16)

***

### overview

> **overview**: `string`

Defined in: [harvest.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/docs/src/harvest.ts#L24)

Markdown prose from the leading /** */ doc-comment of src/index.ts.

***

### peerDependencies

> **peerDependencies**: `string`[]

Defined in: [harvest.ts:22](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/docs/src/harvest.ts#L22)

***

### private

> **private**: `boolean`

Defined in: [harvest.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/docs/src/harvest.ts#L20)

***

### readme

> **readme**: `string`

Defined in: [harvest.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/docs/src/harvest.ts#L26)

The package's README.md, verbatim (the hand-written usage docs), or "" if it has none.

***

### repoRelDir

> **repoRelDir**: `string`

Defined in: [harvest.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/docs/src/harvest.ts#L28)

The package directory relative to the repo root (e.g. `tooling/ts/packages/core`) — used to rewrite README links.

***

### slug

> **slug**: `string`

Defined in: [harvest.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/docs/src/harvest.ts#L17)

***

### version

> **version**: `string`

Defined in: [harvest.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/docs/src/harvest.ts#L19)
