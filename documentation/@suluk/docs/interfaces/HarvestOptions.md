[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/docs](../README.md) / HarvestOptions

# Interface: HarvestOptions

Defined in: [harvest.ts:129](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/docs/src/harvest.ts#L129)

`@suluk/docs` — generate an intuitive static documentation site for a Bun/TS monorepo, straight from source
(package.json + the leading doc-comments + exports + ARCHITECTURE/README). The output is plain HTML + one
stylesheet, deployable to GitHub Pages with zero build. Suluk documents itself with it. CANDIDATE tooling.

## Properties

### architecturePath?

> `optional` **architecturePath?**: `string`

Defined in: [harvest.ts:135](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/docs/src/harvest.ts#L135)

***

### description

> **description**: `string`

Defined in: [harvest.ts:133](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/docs/src/harvest.ts#L133)

***

### excludePrivate?

> `optional` **excludePrivate?**: `boolean`

Defined in: [harvest.ts:139](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/docs/src/harvest.ts#L139)

Exclude private/example packages from the public docs (default false — include them, flagged).

***

### packagesDir

> **packagesDir**: `string`

Defined in: [harvest.ts:130](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/docs/src/harvest.ts#L130)

***

### repoRoot?

> `optional` **repoRoot?**: `string`

Defined in: [harvest.ts:137](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/docs/src/harvest.ts#L137)

Repo root — when given, each package's README links resolve against its path from here (→ GitHub blob URLs).

***

### repoUrl

> **repoUrl**: `string`

Defined in: [harvest.ts:134](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/docs/src/harvest.ts#L134)

***

### tagline

> **tagline**: `string`

Defined in: [harvest.ts:132](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/docs/src/harvest.ts#L132)

***

### title

> **title**: `string`

Defined in: [harvest.ts:131](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/docs/src/harvest.ts#L131)
