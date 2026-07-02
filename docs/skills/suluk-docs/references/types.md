# Types & Enums

## harvest

### `FrameworkDoc`
`@suluk/docs` — generate an intuitive static documentation site for a Bun/TS monorepo, straight from source
(package.json + the leading doc-comments + exports + ARCHITECTURE/README). The output is plain HTML + one
stylesheet, deployable to GitHub Pages with zero build. Suluk documents itself with it. CANDIDATE tooling.
**Properties:**
- `title: string`
- `tagline: string`
- `description: string`
- `repoUrl: string`
- `packages: PackageDoc[]`
- `architecture: string` (optional) — ARCHITECTURE.md (markdown), if present.

### `PackageDoc`
`@suluk/docs` — generate an intuitive static documentation site for a Bun/TS monorepo, straight from source
(package.json + the leading doc-comments + exports + ARCHITECTURE/README). The output is plain HTML + one
stylesheet, deployable to GitHub Pages with zero build. Suluk documents itself with it. CANDIDATE tooling.
**Properties:**
- `name: string`
- `slug: string`
- `description: string`
- `version: string`
- `private: boolean`
- `dependencies: string[]`
- `peerDependencies: string[]`
- `overview: string` — Markdown prose from the leading /** */ doc-comment of src/index.ts.
- `readme: string` — The package's README.md, verbatim (the hand-written usage docs), or "" if it has none.
- `repoRelDir: string` — The package directory relative to the repo root (e.g. `tooling/ts/packages/core`) — used to rewrite README links.
- `exports: string[]` — Public symbols re-exported from the barrel.
- `modules: ModuleDoc[]` — Per-module leading doc-comments.

### `ModuleDoc`
`@suluk/docs` — generate an intuitive static documentation site for a Bun/TS monorepo, straight from source
(package.json + the leading doc-comments + exports + ARCHITECTURE/README). The output is plain HTML + one
stylesheet, deployable to GitHub Pages with zero build. Suluk documents itself with it. CANDIDATE tooling.
**Properties:**
- `file: string`
- `doc: string`

## render

### `SiteFile`
**Properties:**
- `path: string`
- `content: string`

## diagram

### `PackageGraph`
**Properties:**
- `nodes: { id: string; label: string }[]`
- `links: { source: string; target: string }[]`

### `ArchitectureGraph`
**Properties:**
- `nodes: ArchNode[]`
- `links: { source: string; target: string }[]`

### `ArchNode`
A package node enriched for the UML architecture diagram (name, public-export count, a sample of exports).
**Properties:**
- `id: string`
- `name: string`
- `exports: number` — Number of public symbols the barrel re-exports (the node's surface-area badge).
- `topExports: string[]` — A small deterministic sample of exported symbol names (for the node's members compartment).
