# Functions

## harvest

### `harvest`
`@suluk/docs` — generate an intuitive static documentation site for a Bun/TS monorepo, straight from source
(package.json + the leading doc-comments + exports + ARCHITECTURE/README). The output is plain HTML + one
stylesheet, deployable to GitHub Pages with zero build. Suluk documents itself with it. CANDIDATE tooling.
```ts
harvest(opts: HarvestOptions): FrameworkDoc
```
**Parameters:**
- `opts: HarvestOptions`
**Returns:** `FrameworkDoc`

### `harvestPackage`
`@suluk/docs` — generate an intuitive static documentation site for a Bun/TS monorepo, straight from source
(package.json + the leading doc-comments + exports + ARCHITECTURE/README). The output is plain HTML + one
stylesheet, deployable to GitHub Pages with zero build. Suluk documents itself with it. CANDIDATE tooling.
```ts
harvestPackage(dir: string, repoRoot?: string): PackageDoc | null
```
**Parameters:**
- `dir: string`
- `repoRoot: string` (optional)
**Returns:** `PackageDoc | null`

### `stripReadmeHeader`
Strip a README's leading branding/header chrome so it integrates under the site's own page title without a
duplicate logo + H1. Handles both house styles: the centered-logo HTML header (`<p align="center">…</p>` +
`<h1 align="center">` + taglines + `---`) and the plain `# @pkg` H1 followed by a bold one-line value-prop.
Everything from the first real content line (the CANDIDATE note / intro prose / first `##`) is kept.
```ts
stripReadmeHeader(md: string): string
```
**Parameters:**
- `md: string`
**Returns:** `string`

### `firstBlockComment`
Extract + clean the first JSDoc block comment.
```ts
firstBlockComment(src: string): string
```
**Parameters:**
- `src: string`
**Returns:** `string`

### `parseExports`
Collect the public symbol names a barrel re-exports.
```ts
parseExports(src: string): string[]
```
**Parameters:**
- `src: string`
**Returns:** `string[]`

## site

### `generateSite`
```ts
generateSite(fw: FrameworkDoc, opts: SiteOptions): SiteFile[]
```
**Parameters:**
- `fw: FrameworkDoc`
- `opts: SiteOptions` — default: `{}`
**Returns:** `SiteFile[]`

## render

### `renderIndex`
```ts
renderIndex(fw: FrameworkDoc): string
```
**Parameters:**
- `fw: FrameworkDoc`
**Returns:** `string`

### `renderPackage`
```ts
renderPackage(fw: FrameworkDoc, p: PackageDoc): string
```
**Parameters:**
- `fw: FrameworkDoc`
- `p: PackageDoc`
**Returns:** `string`

### `renderMarkdownPage`
```ts
renderMarkdownPage(fw: FrameworkDoc, file: string, title: string, md: string): string
```
**Parameters:**
- `fw: FrameworkDoc`
- `file: string`
- `title: string`
- `md: string`
**Returns:** `string`

## md

### `mdToHtml`
```ts
mdToHtml(md: string): string
```
**Parameters:**
- `md: string`
**Returns:** `string`

### `inline`
Inline spans: `code`, `![alt](url)` image, `[text](url)`, **bold**, *italic*. Escapes first, then injects safe tags.
```ts
inline(text: string): string
```
**Parameters:**
- `text: string`
**Returns:** `string`

### `escapeHtml`
```ts
escapeHtml(s: string): string
```
**Parameters:**
- `s: string`
**Returns:** `string`

### `rewriteRepoLinks`
Rewrite repo-RELATIVE markdown links (`](../../doc/x.md)`, `](./y)`) to absolute GitHub blob URLs so a
README harvested into the site doesn't ship dead links. `relDir` is the package's path from the repo root
(e.g. `tooling/ts/packages/core`); the link is resolved against it and normalized. Absolute links
(`http(s):`, `mailto:`, protocol-relative), pure `#anchors`, and already-absolute paths are left untouched.
```ts
rewriteRepoLinks(md: string, repoUrl: string, relDir: string, ref: string): string
```
**Parameters:**
- `md: string`
- `repoUrl: string`
- `relDir: string`
- `ref: string` — default: `"main"`
**Returns:** `string`

## diagram

### `packageGraphData`
The `@suluk` package dependency graph as pure data (each package → its drawn `@suluk` dependencies) — the input
to the d3 renderer (build tooling), replacing the old D2/kroki path. Zero-dep, so it stays in `@suluk/docs`.
```ts
packageGraphData(packages: PackageDoc[]): PackageGraph
```
**Parameters:**
- `packages: PackageDoc[]`
**Returns:** `PackageGraph`

### `architectureGraphData`
The `@suluk` graph enriched for the UML "Strata-of-Derivation" architecture diagram: each package carries its
export count + a sample of export names so the renderer can draw a UML class-box (name + members compartment)
per package, and the same `@suluk`-only dependency edges as packageGraphData. Pure data, zero-dep —
the layout/stereotypes/colours live in the build-tooling renderer (`scripts/pkggraph.ts`).
```ts
architectureGraphData(packages: PackageDoc[]): ArchitectureGraph
```
**Parameters:**
- `packages: PackageDoc[]`
**Returns:** `ArchitectureGraph`

### `packageGraphD2`
```ts
packageGraphD2(packages: PackageDoc[]): string
```
**Parameters:**
- `packages: PackageDoc[]`
**Returns:** `string`
> **Deprecated:** D2 is being retired across the repo in favour of d3 (see `packageGraphData` + the d3 SVG renderer
in `scripts/pkggraph.ts`). Kept for backward compatibility; no longer used by the docs build.

### `krokiD2Url`
```ts
krokiD2Url(d2: string): string
```
**Parameters:**
- `d2: string`
**Returns:** `string`
> **Deprecated:** Part of the retired D2/kroki path; use `packageGraphData` + the d3 SVG renderer instead.
A kroki.io render URL for D2 source (deflate + base64url).
