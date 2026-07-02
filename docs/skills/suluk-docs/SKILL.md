---
description: "Generate an intuitive static documentation site for a Bun/TS monorepo, straight from source (package.json + doc-comments + exports + README/ARCHITECTURE). Deployable to GitHub Pages. CANDIDATE tooling."
name: suluk-docs
---

# @suluk/docs

Generate an intuitive static documentation site for a Bun/TS monorepo, straight from source (package.json + doc-comments + exports + README/ARCHITECTURE). Deployable to GitHub Pages. CANDIDATE tooling.

## Quick Start

```ts
import { harvest, generateSite } from "@suluk/docs";
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

const fw = harvest({
  packagesDir: join(import.meta.dir, "packages"),
  title: "Suluk",
  tagline: "One typed contract — projected into your entire stack.",
  description: "**Suluk** derives the whole stack from one source.",
  repoUrl: "https://github.com/MahmoodKhalil57/suluk",
  architecturePath: join(import.meta.dir, "ARCHITECTURE.md"), // optional — prepends to the Architecture page
  // excludePrivate: true,   // drop demo/private packages from the public docs (default: include, flagged)
});

const out = join(import.meta.dir, "site");
for (const f of generateSite(fw)) {
  const p = join(out, f.path);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, f.content);
}
// → site/index.html, site/<pkg>.html, site/architecture.html, site/style.css, site/.nojekyll, …
```

## Configuration

2 configuration interfaces — see references/config.md for details.

## Quick Reference

**harvest:** `harvest` (`@suluk/docs` — generate an intuitive static documentation site for a Bun/TS monorepo, straight from source
(package), `harvestPackage` (`@suluk/docs` — generate an intuitive static documentation site for a Bun/TS monorepo, straight from source
(package), `stripReadmeHeader` (Strip a README's leading branding/header chrome so it integrates under the site's own page title without a
duplicate logo + H1), `firstBlockComment` (Extract + clean the first JSDoc block comment), `parseExports` (Collect the public symbol names a barrel re-exports), `FrameworkDoc` (`@suluk/docs` — generate an intuitive static documentation site for a Bun/TS monorepo, straight from source
(package), `PackageDoc` (`@suluk/docs` — generate an intuitive static documentation site for a Bun/TS monorepo, straight from source
(package), `ModuleDoc` (`@suluk/docs` — generate an intuitive static documentation site for a Bun/TS monorepo, straight from source
(package)
**site:** `generateSite`
**render:** `renderIndex`, `renderPackage`, `renderMarkdownPage`, `SiteFile`, `STYLE` (The only hand-written CSS: typography for the rendered Markdown)
**md:** `mdToHtml`, `inline` (Inline spans: `code`, `), `escapeHtml`, `rewriteRepoLinks` (Rewrite repo-RELATIVE markdown links (`]()
**diagram:** `packageGraphData` (The `@suluk` package dependency graph as pure data (each package → its drawn `@suluk` dependencies) — the input
to the d3 renderer (build tooling), replacing the old D2/kroki path), `architectureGraphData` (The `@suluk` graph enriched for the UML "Strata-of-Derivation" architecture diagram: each package carries its
export count + a sample of export names so the renderer can draw a UML class-box (name + members compartment)
per package, and the same `@suluk`-only dependency edges as packageGraphData), `packageGraphD2`, `krokiD2Url`, `PackageGraph`, `ArchitectureGraph`, `ArchNode` (A package node enriched for the UML architecture diagram (name, public-export count, a sample of exports))

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`
- When configuring options → read `references/config.md` for all settings and defaults

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)