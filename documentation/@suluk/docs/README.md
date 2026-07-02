[**Suluk**](../../README.md)

***

[Suluk](../../packages.md) / @suluk/docs

<p align="center">
  <a href="https://github.com/MahmoodKhalil57/suluk">
    <img src="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/wordmark.png" alt="Suluk" width="360" />
  </a>
</p>

<h1 align="center">@suluk/docs</h1>

<p align="center"><b>Generate a static documentation site for a Bun/TS monorepo, straight from source — no build, no annotations beyond the code's own doc-comments.</b></p>

<p align="center">
  <em>Part of <a href="https://github.com/MahmoodKhalil57/suluk">Suluk</a> — one typed OpenAPI v4 contract projecting into every full-stack layer.</em>
</p>

---

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```sh
bun add @suluk/docs
```

## What it does

It harvests a Bun/TS workspace into a documentation model and renders it to a flat, self-hosting site — the same "one source, many projections" discipline as the rest of Suluk, applied to the *monorepo itself*.

- **Harvests from source.** For each package directory it reads `package.json` (name / description / version / deps), the leading doc-comment of `src/index.ts` as the overview, the public exports of that barrel, and each module's leading doc-comment. No extra annotations — it uses the comments the code already carries.
- **Renders a complete site.** A landing page, one page per package (install + overview + public API + deps + modules), an Architecture page with a generated package-dependency diagram, plus curated Get-started / Contributing / Community pages.
- **Zero-build output.** Plain HTML + one stylesheet + a `.nojekyll`, with relative links — drop the files on GitHub Pages (even a project-pages subpath) and it serves verbatim. Suluk documents itself this way.
- **Composable primitives.** A small dependency-free Markdown→HTML renderer (`mdToHtml`) and a D2 package-graph + kroki URL helper are exported on their own.

## When to reach for it

Reach for it to document **the monorepo / toolkit itself** — the packages, how they depend on each other, what each one exports. It reads structure from `package.json` + barrel doc-comments, so it stays in sync as you add packages.

It does **not** document your *API*. For an OpenAPI v4 reference site use `@suluk/reference` / `@suluk/scalar` / `@suluk/swagger` (those project the v4 *document*; this projects the *codebase*).

## Usage

The common case is two calls — `harvest` a packages directory into a `FrameworkDoc`, then `generateSite` it into files you write to disk.

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

`generateSite` returns `SiteFile[]` (`{ path, content }`) — no I/O of its own, so you own where the bytes land. Override the curated pages by passing Markdown:

```ts
generateSite(fw, {
  gettingStarted: "# Get started\n\nYour own intro…",
  contributing: "# Contributing\n\n…",
  community: "# Community\n\n…",
});
```

### Harvest one package, or render one page

The harvest and render steps are exposed individually:

```ts
import { harvestPackage, renderIndex, renderPackage } from "@suluk/docs";

const pkg = harvestPackage("./packages/core");  // → PackageDoc | null (null if no package.json)
const indexHtml = renderIndex(fw);              // the landing page
const pageHtml = renderPackage(fw, fw.packages[0]); // one package page
```

### The standalone primitives

```ts
import {
  mdToHtml, parseExports, firstBlockComment,
  packageGraphD2, krokiD2Url, STYLE,
} from "@suluk/docs";

mdToHtml("# Hi\n\n`code`, **bold**, and a [link](https://suluk.dev)"); // → HTML string
parseExports(`export { a, b as c } from "./x";`);                     // → ["a", "c"]
firstBlockComment("/**\n * one\n * two\n */");                        // → "one\ntwo"

const d2 = packageGraphD2(fw.packages); // D2 of the @suluk dependency graph (private pkgs omitted)
krokiD2Url(d2);                         // → https://kroki.io/d2/svg/… (deflate+base64url, renders the diagram)
STYLE;                                  // the site's single stylesheet, if you assemble pages yourself
```

## API

| Export | What it does |
| --- | --- |
| `harvest(opts)` | Read a packages dir → `FrameworkDoc` (every package's name, overview, exports, deps, modules). |
| `harvestPackage(dir)` | Harvest a single package dir → `PackageDoc \| null`. |
| `generateSite(fw, opts?)` | Assemble the whole site → `SiteFile[]` (`{ path, content }`); no I/O. |
| `renderIndex(fw)` | Render just the landing page → HTML. |
| `renderPackage(fw, p)` | Render one package page → HTML. |
| `renderMarkdownPage(fw, file, title, md)` | Render a curated Markdown page into the site chrome → HTML. |
| `mdToHtml(md)` / `inline(text)` / `escapeHtml(s)` | Dependency-free Markdown / inline-span / HTML-escape helpers. |
| `parseExports(src)` | Collect the public symbol names a barrel re-exports. |
| `firstBlockComment(src)` | Extract + clean the first JSDoc block comment. |
| `packageGraphD2(packages)` | D2 source for the `@suluk` package-dependency graph. |
| `krokiD2Url(d2)` | A `kroki.io` render URL for D2 source. |
| `STYLE` | The site's single stylesheet (string). |

Types: `FrameworkDoc`, `PackageDoc`, `ModuleDoc`, `HarvestOptions`, `SiteOptions`, `SiteFile`.

## Boundary

This package **renders, never hosts** (the L3 line). `generateSite` returns the files; *you* write them and serve them (GitHub Pages, any static host). It reads from a directory of packages and emits HTML strings — no network in the harvest/render path, and the only outbound URL it constructs is the kroki render link for the architecture diagram. What it documents is the *codebase* (package structure + doc-comments), not your runtime API — that projection belongs to `@suluk/reference` / `@suluk/scalar` / `@suluk/swagger`.

## License

Apache-2.0

## Interfaces

- [FrameworkDoc](interfaces/FrameworkDoc.md)
- [HarvestOptions](interfaces/HarvestOptions.md)
- [ModuleDoc](interfaces/ModuleDoc.md)
- [PackageDoc](interfaces/PackageDoc.md)
- [PackageGraph](interfaces/PackageGraph.md)
- [SiteFile](interfaces/SiteFile.md)
- [SiteOptions](interfaces/SiteOptions.md)

## Variables

- [STYLE](variables/STYLE.md)

## Functions

- [escapeHtml](functions/escapeHtml.md)
- [firstBlockComment](functions/firstBlockComment.md)
- [generateSite](functions/generateSite.md)
- [harvest](functions/harvest.md)
- [harvestPackage](functions/harvestPackage.md)
- [inline](functions/inline.md)
- [~~krokiD2Url~~](functions/krokiD2Url.md)
- [mdToHtml](functions/mdToHtml.md)
- [~~packageGraphD2~~](functions/packageGraphD2.md)
- [packageGraphData](functions/packageGraphData.md)
- [parseExports](functions/parseExports.md)
- [renderIndex](functions/renderIndex.md)
- [renderMarkdownPage](functions/renderMarkdownPage.md)
- [renderPackage](functions/renderPackage.md)
- [rewriteRepoLinks](functions/rewriteRepoLinks.md)
- [stripReadmeHeader](functions/stripReadmeHeader.md)
