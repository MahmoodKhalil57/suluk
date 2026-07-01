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

**BUILT (local, verified end-to-end) — live deploy pending operator go.** Ceiling **0.6** (built + verified
against the real repo, not yet published/deployed; docs tooling, lower stakes than spec). The full pipeline runs
`exit 0`, emits **1652 pages** (44 library packages + 4 guide documents + a narrative home), themed by
`typedoc-github-theme@0.4.0` with a `vscode-icons`/`codicon` icon plugin, favicon + OG/Twitter on every page,
and a fresh D2 package-graph on the Architecture page. Verified in a scratch out-dir at every phase and once
into the real `docs/` (then restored). The first live publish is the operator's `bun run deploy:docs`.

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

1. **One TypeDoc render is the whole site.** `tooling/ts/typedoc.json`, `entryPointStrategy: "packages"` over
   `packages/*` (44 documented; `example-petshop`/`scalar-standalone`/`vscode` excluded as non-library —
   private demo, prebuilt bundle, editor-extension app). `packageOptions` (not 44 per-package files) sets
   `entryPoints: src/index.ts`, `includeVersion`, `excludeInternal/Private`, `skipErrorChecking` (the key that
   lets raw-TS + hoisted peer/workspace deps convert). `out: ../../docs`, `cleanOutputDir`, `githubPages`.
2. **Narrative lives in TypeDoc.** `readme: docs-pages/index.md` (home) + `projectDocuments`
   (getting-started / architecture / contributing / community). Prose ported from the bespoke `site.ts`; internal
   links are TypeDoc-resolved relative `.md` links. The Architecture page's D2 dependency graph is regenerated
   each build by `scripts/gen-doc-pages.ts` (reusing `@suluk/docs`' `harvest` + `packageGraphD2`) so it can't drift.
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
  (accepted; the operator asked for local push). 63 **cosmetic** build warnings remain (cross-package `{@link}`,
  internal-type refs, a couple README relative links, one `ini` code fence) — non-blocking, `exit 0`; deferred as
  hygiene rather than churning 40 packages' doc-comments. The daisyUI `dim` narrative theme, the bespoke
  per-package README-as-page treatment, and the old HTML card grid are dropped (the unified-site tradeoff the
  operator chose). The icon-object override is the most version-brittle piece — mitigated by the exact `typedoc`
  pin and a documented chrome-only fallback.
- **Supersedes** the bespoke generator as the *deployed* surface; `gen-docs.ts` + `@suluk/docs`' `render`/`site`
  remain in-tree (harvester reused; the HTML renderers now dormant). Reversible: restore `docs.yml` + re-run
  `gen-docs.ts`.
