# C54. Unified TypeDoc docs pipeline — one github-themed site, vscode-icons, local build-and-push

> **Provenance:** Candidate-fork ADR (Suluk), not a SIG decision. Operator-surfaced: *"can we use typedoc in
> @suluk/docs to auto generate docs locally for each package so we can also generate a general suluk docs with
> typedoc locally and host it to github pages automatically by building locally and pushing (no github actions),
> we will then use typedoc-github-theme with icones collection/vscode-icons to theme the entire docs"*. The
> replace-vs-augment fork was put to the operator, who chose **"Unified TypeDoc site"** (one TypeDoc-themed
> surface for everything, narrative ported into TypeDoc document pages). Grounded in a 7-agent research+probe
> workflow (TypeDoc monorepo config · typedoc-github-theme · icones/vscode-icons icon API · local Pages deploy ·
> a REAL 46-package probe build · a map of the bespoke generator) — the probe measured raw extraction as
> excellent (exit 0, 1697 pages, export counts matching the bespoke harvester). Supersedes the bespoke
> README-harvesting site generator as the *deployed* surface (the `@suluk/docs` harvester library stays).

Date: 2026-07-01

## Status

**BUILT + LIVE.** Ceiling **0.6** (built + verified against the real repo + deployed; docs tooling, lower stakes
than spec). Themed by `typedoc-github-theme@0.4.0` with a `vscode-icons`/`codicon` icon plugin, favicon +
OG/Twitter on every page, and a fresh D2 package-graph on the Architecture page. The first form (one merged
`entryPointStrategy: "packages"` render → 1652 pages) shipped live; then **revised to MULTI-ROOT** (below).

### Revision (2026-07-01) — MULTI-ROOT, operator: *"each module should be treated as a root typedoc complete with documents"*

The single merged render made each package a thin *module* inside one site. Operator wanted each package to be
its **own complete root** — its README as home, its own guide documents, its own API — with a general Suluk site
tying them together (operator chose **"umbrella + package index"**: no duplicated merged API). So the pipeline is
now **N+1 TypeDoc renders** (driven by the Node API, not a single `typedoc.json` — each root needs its own
name/entryPoints/readme/out/navigationLinks):

- **`docs/`** — the **umbrella**: a *documents-only* render (verified supported in 0.28.19 — `entryPoints: []`):
  the narrative home (`readme: index.md`) + `projectDocuments` getting-started / architecture / **packages** /
  **registry** / **specification** / contributing / community. The **Packages index** (`packages.md`) is generated
  with raw-HTML `<a>` links to each root (so TypeDoc doesn't try to resolve them). A nested **Specification**
  section (added at the operator's request — *"another directory about Suluk itself as the OpenAPI v4 candidate,
  the spec … something like swagger.io/specification"*) renders Suluk-the-spec as a document tree (a parent doc
  with `children` frontmatter): the full 5028-line `SPEC.md`, the design notes (signatures/templating/parameters/
  collections), conformance, confidence, the Rust **`suluk-core`** reference implementation, and Moonwalk priors,
  plus links to the associated files (meta-schema, `v4-types.ts`, the petstore example, the conformance corpus). A
  **Registry** page (from `registry/README.md`) covers the shadcn registry. All umbrella docs are staged into one
  temp dir before rendering — TypeDoc resolves a document's `children` relative to the *common directory* of all
  `projectDocuments`, so mixing `docs-pages/` (deep in the repo) with `/tmp` would make that common dir `/` and
  ENOENT the children glob; one shared base dir avoids it. Spec/registry sources are absolutized + branding-
  stripped, not committed (the source stays `specification/` + `registry/`).
- **`docs/packages/<name>/`** — each `@suluk/*` package as its **own complete root site**: README home, any
  per-package guides (`packages/<name>/docs-pages/*.md` if present), the full API, the same theme + icon +
  branding plugins, and a `↑ Suluk` back-link (absolute URL, depth-robust) + a GitHub-source link.

Witnessed: a full build = **umbrella + 44 roots, 1741 pages, exit 0**, every root with `index.html` + `.nojekyll`,
README homes, colour-tinted vscode-icons, OG/social-card on deep pages, and the umbrella's raw-HTML package links
resolving to the roots. `typedoc.json` is removed (the build is script-driven: `build-docs.ts` via the Node API).

## Context

The deployed docs site (`https://mahmoodkhalil57.github.io/suluk/`, served `main:/docs`) was a **bespoke,
zero-dependency static-site generator**: `@suluk/docs` harvested each package's README + `package.json` +
exports + doc-comments and rendered narrative HTML (daisyUI/Tailwind CDN, theme `dim`); `.github/workflows/docs.yml`
regenerated `docs/` on every push and committed it back. This produced narrative pages but **no symbol-level API
reference** (per-export payload was bare name strings — no signatures, params, returns, or per-symbol JSDoc).

TypeDoc produces exactly that missing surface, directly from raw TS source (no build) via the TypeScript
compiler. The operator asked to adopt it, theme it with `typedoc-github-theme` + `vscode-icons`, and deploy by
**building locally and pushing** (retiring the Action). The load-bearing fork was whether TypeDoc should
*augment* (an API section beside the narrative) or *replace* (one unified TypeDoc site). The operator chose
**unified**: one themed surface, with the narrative ported into TypeDoc document pages.

## Decision

*(Structure below reflects the multi-root revision; the merged-render details are kept in the Status for history.)*

1. **The site is N+1 TypeDoc renders (`scripts/build-docs.ts`, Node API).** An **umbrella** at `docs/` +
   one **root per package** at `docs/packages/<name>/`. Documented set = `packages/*` minus
   `example-petshop`/`scalar-standalone`/`vscode` (private demo / prebuilt bundle / editor-extension app) and any
   `private` package, resolved by `documentedPackages()` (the single source of truth, in `gen-doc-pages.ts`).
   Shared render options (theme + icon + branding plugins, `excludeInternal/Private`, `skipErrorChecking` — the
   key that lets raw-TS + hoisted peer/workspace deps convert — `includeVersion`, `githubPages`,
   `entryPointStrategy: "resolve"`) live in a `BASE` object; per-render overrides set name/entryPoints/readme/out/
   navigationLinks. The umbrella builds first (its `cleanOutputDir` wipes `docs/`, incl. a stale `docs/packages/`);
   roots write into subdirs after. `typedoc.json` is removed (a single config can't express N renders).
2. **Narrative lives in TypeDoc — as the umbrella.** A *documents-only* render (`entryPoints: []`):
   `readme: docs-pages/index.md` (home) + `projectDocuments` getting-started / architecture / **packages** /
   contributing / community. Internal links are TypeDoc-resolved relative `.md`. The **Packages index**
   (`packages.md`) and the Architecture D2 graph are regenerated each build by `scripts/gen-doc-pages.ts`
   (reusing `@suluk/docs`' `harvest` + `packageGraphD2`); the index uses raw-HTML `<a href="packages/<name>/">`
   links (bypassing TypeDoc link-resolution) to each root. **Each package root** carries the package README as its
   home + any `packages/<name>/docs-pages/*.md` as its own documents + a `↑ Suluk` back-link.
3. **Theme + icons.** `typedoc-github-theme` (additive, zero-config). A local plugin
   (`scripts/typedoc-vscode-icons.mjs`) re-skins the icon set: reflection kinds → **codicon `symbol-*`** glyphs
   tinted with TypeDoc's own `--color-ts-*` vars (VS Code look, color-coding preserved, theme-correct via
   `currentColor`/`color`); modules & folders → colourful **vscode-icons**; toolbar chrome → codicon. Mutates
   `app.renderer.theme.icons` at `RendererEvent.BEGIN` (verified safe against typedoc@0.28.19 source; TypeDoc is
   pinned exactly because the icon internals shift across minors).
4. **Branding site-wide.** `scripts/typedoc-branding-head.mjs` injects favicon + OG/Twitter meta via the
   `head.end` render hook — on **every** page (strictly better than the old top-level-only injector), with a
   per-page `og:title`.
5. **Local deploy, no Actions.** `scripts/deploy-docs.ts` = gen-doc-pages → typedoc → `.nojekyll` → `git add
   --all docs` → commit → push. `.github/workflows/docs.yml` is retired (Pages source setting is untouched —
   `main:/docs` keeps serving; only auto-regen stops). `deploy:docs` / `docs` (dry-run) scripts on
   `suluk-tooling`.
6. **The published `@suluk/docs` package is unchanged and stays runtime-zero-dep.** The TypeDoc toolchain is a
   devDependency of the **private** `suluk-tooling` workspace root (never publishes); `@suluk/docs`' harvester
   (`harvest`/`packageGraphD2`) is *reused* by the pipeline, so the package remains the home of the docs logic
   without a heavy `typedoc` dependency reaching consumers.

## Consequences

- **Gain:** a real symbol-level API reference for all 44 packages, one consistent VS-Code-flavoured theme across
  home + guides + API, favicon/social-card on every page (the HN-share surface now covers the deep tree too),
  and a one-command local publish. 7 previously README-less packages (billing, credits, examples, keys, payments,
  provision, stubgen) got real, source-grounded READMEs (also improving their npm pages).
- **Cost / honest boundaries:** docs no longer auto-update on package changes — someone runs `deploy:docs`
  (accepted; the operator asked for local push). **Build warnings are now 0** (the multi-root build's warnings
  were cleaned: `highlightLanguages` gained `ini`; each package README's repo-relative links are absolutized to
  GitHub `tree/`(dir)/`blob/`(file) URLs at build time via `absolutizeRepoLinks`; the generated `packages.md`
  index uses absolute hosted URLs; and prose `@word`/`@suluk/x` references in doc-comments were backticked across
  ~64 files so TypeDoc no longer mis-parses them as block tags). The daisyUI `dim` narrative theme, the bespoke
  per-package README-as-page treatment, and the old HTML card grid are dropped (the unified-site tradeoff the
  operator chose). The icon-object override is the most version-brittle piece — mitigated by the exact `typedoc`
  pin and a documented chrome-only fallback.
- **Supersedes** the bespoke generator as the *deployed* surface; `gen-docs.ts` + `@suluk/docs`' `render`/`site`
  remain in-tree (harvester reused; the HTML renderers now dormant). Reversible: restore `docs.yml` + re-run
  `gen-docs.ts`.
