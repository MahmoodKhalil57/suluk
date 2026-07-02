# Configuration

## HarvestOptions

`@suluk/docs` — generate an intuitive static documentation site for a Bun/TS monorepo, straight from source
(package.json + the leading doc-comments + exports + ARCHITECTURE/README). The output is plain HTML + one
stylesheet, deployable to GitHub Pages with zero build. Suluk documents itself with it. CANDIDATE tooling.

### Properties

#### packagesDir

**Type:** `string`

**Required:** yes

#### title

**Type:** `string`

**Required:** yes

#### tagline

**Type:** `string`

**Required:** yes

#### description

**Type:** `string`

**Required:** yes

#### repoUrl

**Type:** `string`

**Required:** yes

#### architecturePath

**Type:** `string`

#### repoRoot

Repo root — when given, each package's README links resolve against its path from here (→ GitHub blob URLs).

**Type:** `string`

#### excludePrivate

Exclude private/example packages from the public docs (default false — include them, flagged).

**Type:** `boolean`

## SiteOptions

### Properties

#### gettingStarted

Markdown overrides for the curated pages.

**Type:** `string`

#### contributing

**Type:** `string`

#### community

**Type:** `string`