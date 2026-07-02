# Configuration

## CompositionOptions

### Properties

#### budgets

Max allowed count per metric before it's a violation (default 0 — pure composition).

**Type:** `Partial<Record<Metric, number>>`

#### ignoreTags

Lowercase tag names NOT counted as native HTML (framework/control elements).

**Type:** `string[]`

#### allowGetStaticPaths

Treat Astro's page-bound `getStaticPaths` as allowed page-level logic, exempt from the frontmatter budget (default true).

**Type:** `boolean`