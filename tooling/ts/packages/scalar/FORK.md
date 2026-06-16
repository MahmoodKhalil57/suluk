# Forking Scalar for OpenAPI v4 — the phased plan

## Delivery — native v4 works OUT OF THE BOX *(SHIPPED, v0.8.0)*

The fork bundle is now published as **`@suluk/scalar-standalone`** and served from **jsdelivr-npm**, and
`scalarV4Html`/`scalarV4Response` default `cdn` to it (`SULUK_FORK_CDN`). So ANY consumer's native-v4 view renders
`requests`→operations with zero vendoring. (Before this, `scalarV4Response` defaulted to the VANILLA Scalar CDN —
which can't project v4 — so a fresh consumer who didn't hand-vendor the fork saw only `components.schemas` / "Models".
saasuluk hand-vendored it via `scripts/vendor-scalar.ts` reaching into this monorepo; a fresh consumer had no path.)
Override `cdn` to self-host the bytes from your own origin (the local-first / no-CDN posture). Rebuild the bundle with
`tooling/ts/scalar-fork/build.sh`, copy `dist/standalone-suluk.js` into `packages/scalar-standalone/dist/`, bump that
package + `SULUK_FORK_STANDALONE_VERSION`, and republish.

## Current state (live)

- **`/reference`** — OUR forked Scalar (`standalone-suluk.js` = latest upstream + the suluk patch-set), driven by
  `scalarV4Html`. **Scalar now ingests OpenAPI v4 NATIVELY** — we feed it the real v4 doc (`openapi: 4.0.0-candidate`,
  `paths[uri].requests` keyed by name) and patch `@scalar/workspace-store`'s `client.ts` to call `projectV4ToStore`
  right after `upgrade()` (patch `0003`): it maps `requests`→method-keyed 3.x ops (request-name → `operationId` +
  title, `parameterSchema`→`parameters[]`, named responses→status map, composition folded) BEFORE `coerce()` would
  strip the unknown `requests` key. The version badge reads **`OpenAPI 4.0.0-candidate`** (via `x-original-oas-version`),
  not `3.1.0` — there is no pre-downgrade outside Scalar anymore. The engine + try-it render the projected ops; the
  lossy boundary is multi-request-per-method (deferred — saasuluk has 0 collisions). The suluk facets ride along: the
  host (`enrichedV4`) stamps `x-badges` on each v4 **request**, and `projectV4ToStore` carries them through to the op.
  ALL the v4 superpowers are folded **into Scalar's OWN chrome**, via its slot API (patch `0001`) — **no custom top
  bar, no hardcoded colours**, so it adapts to every Scalar theme (verified light↔dark; the accent is the theme's, not
  a brand override). Two reliably-mounting slots carry it:
  - **`content-start`** returns a fragment, all styled with `--scalar-*` tokens:
    - cost/access facet **badges + breakdowns** baked into the spec (separate enrichment, on every op);
    - a native **"⛬ Suluk OpenAPI v4 contract"** facet-summary card (cost coverage + access legend);
    - the FULL superpowers **inline as a themed "⚡ v4 Insights" collapsible** (accent left-rule, not a solid bar) —
      `@suluk/reference`'s cost explorer, **reachability matrix**, **ADA** playground, **hardening** report, in an
      iframe to the host-supplied role-projected `/reference/insights` URL (read off `x-suluk-insights`);
  - **`sidebar-start`** renders the v4 **"View as" role projector** as a native sidebar control (from `x-suluk-views`):
    Anonymous/Signed-in/Admin → dispatches a `suluk:viewas` DOM event the host catches to re-fetch + re-mount with that
    role's projected spec from `/reference/spec?as=`, which also reprojects the inline insights (`…/insights?as=`); the
    selected role survives the re-mount via `x-suluk-view`. (`footer`/`content-end` do *not* surface through
    `v-if="$slots.footer"` / `<Content #end>` in the production bundle — only content-start/sidebar-start mount.)

  No custom chrome, **no drawer**, no second page, no theme override — everything lives inside the one forked-Scalar
  page on Scalar's own design tokens. The vendored bundle is served with a **content-hash `?v=` query**
  (`scripts/scalar-fork-hash.ts`), so a fork rebuild cache-busts every browser.
- **`/scalar`** — VANILLA Scalar (`scalarHtml` with `facetBadges:false`, no theme) on the **unpatched upstream**
  bundle: the plain 4→3 downgrade fed to stock Scalar, superpowers dropped. The "what upstream shows" baseline.

Native v4 ingestion shipped at the **parser boundary** (patch `0003`, `projectV4ToStore`) rather than the full
workspace-store rewrite scoped below — Scalar consumes the v4 doc and projects it internally, so the engine +
try-it stay unchanged. The v4 **request-name identity** is surfaced via Scalar's own operation badge
(`scalarV4Html` defaults `showOperationId: true`, and `projectV4ToStore` sets `operationId` = the v4 request name),
so each operation reads e.g. `createCategory` above its `summary` title.

**Multi-request-per-method shipped too** (patch `0006`) — the one v4 capability a 3.1 view cannot express. When two
v4 requests share a method on one path, `projectV4ToStore` keeps the first at the real path-key and stores each
sibling under a SYNTHETIC key `<realPath>::req::<name>` — unique, so the nav id + try-it locationId stay distinct
per sibling — then strips the marker back to the real path at three display/URL/ref choke points (TraversedEntry's
`:path`, the search-index path, the JSON-Pointer ref). Result: distinct sidebar entries, distinct params/body/
responses/try-it state, both hitting the same real endpoint. saasuluk's doc has **0** collisions (unaffected); the
capability is demonstrated live at **`/reference/showcase`** (`/checkout` with `guestCheckout` + `memberCheckout`).
The full v4 feature surface is now native — nothing remains deferred.



Decision (operator): **fork Scalar and teach it OpenAPI v4**, rather than only relying on `@suluk/reference` (our v4-native renderer). This is a real undertaking — Scalar's engine is 3.x-shaped — so it ships in phases. Each phase is independently useful and deployable; we go only as deep as the value justifies.

## Why it's phased (the honest cost)

Scalar is a ~25-package Vue monorepo. Its entire engine is **`@scalar/workspace-store`** — one normalized model, depended on by every package, built around `paths[path][method] → Operation` with `parameters[]` / `requestBody` / `responses`. OpenAPI v4 (Moonwalk) breaks that model at the root: operations are **`requests` keyed by name**, parameters are **`parameterSchema:{query,path,header,body}`**, responses are named, plus composition/inheritance + ADA identity. So "native v4 in Scalar" is **not a parser plugin — it's a workspace-store rewrite (~3,000–3,500 LoC) touching all 25 packages**, plus a self-hosted Vue build (we'd drop the CDN) and a perpetual upstream-rebase tax (~15 releases/yr ≈ ~50 hrs/yr).

`@suluk/reference` stays the always-current, edge-rendered, v4-native primary. Scalar-for-v4 is the "familiar Scalar UI, taught v4" track.

## Phase 1 — own + surface facets *(SHIPPED)*

Projection-layer only; zero Scalar source changed. In `@suluk/scalar`:

- **Pin** `@scalar/api-reference@1.59.0` (`SCALAR_VERSION`) — off `@latest`, we control the UI.
- **`enrichFacetBadges`** — `x-suluk-cost` + `x-suluk-access` (carried through the v4→3.1 downgrade) become Scalar `x-badges` rendered on every operation. The v4 cost/access info Scalar normally can't show now shows.
- **suluk theme** via `customCss`.

Live: all 97 saasuluk ops show e.g. `🔒 Admin · 💰 130µ$`.

## Phase 2 — richer facet detail *(SHIPPED, partial)*

Still in `@suluk/scalar`, no Scalar source forked. **Shipped:**

- **Progressive disclosure of the facets** (`enrichFacetDetail` + `v4Intro`): the collapsed badge → the cost breakdown *by source* + the full access rule appended to each operation's (markdown) description → a "Suluk v4 contract" intro + cost-coverage tally on the doc. So `POST /category` reads `🔒 Admin · 💰 130µ$` collapsed and expands to `Access — Admin only / Cost — ~130µ$ per call (compute 100µ$ · db-write 30µ$)`.

**Deferred (deliberately):**

- **Multi-request-per-method split** — saasuluk's doc has **0** collisions, so it's latent; and faking distinct path keys to show both in Scalar **breaks try-it** (the path is no longer real). Doing it *correctly* (request-name as identity, try-it intact) needs the request-native engine — that's Phase 3, not a projection hack.
- **Document-level maps** (`x-suluk-jobs` / `x-suluk-agents` / `x-suluk-policy`) + **rate-limit / provenance** badges — saasuluk's doc currently declares **none** of these, so there's nothing to render. Add the rendering when/if a consuming doc uses them (cheap: same pattern as the cost/access badges).

## Phase 3 — the source fork *(NOW SHIPPING — build from latest + patch)*

We build Scalar from **latest upstream** and apply a small patch-set (see `tooling/ts/scalar-fork/`), so we track
upstream while carrying v4 features. **Build solved** (the earlier failure was just running `build:standalone` without
the 18 `@scalar/*` workspace deps built first — `turbo run build --filter=@scalar/api-reference` does it deps-first;
vite 8 / rolldown build fine once the chain is built). **First patch shipped:** `0001-suluk-v4-content-panel` injects a
native "⛬ Suluk OpenAPI v4 contract" panel into Scalar's own `content-start` **slot** at the `createApiReference`
boundary (public slot API → upstream-stable; self-contained). Our patched bundle is self-hosted at `/reference`
(`standalone-suluk.js`); `/scalar` keeps the unpatched upstream as the vanilla baseline.

Deeper, request-native v4 follows the same boundary/slot approach (no engine rewrite needed for saasuluk):

### 3.0 — Self-host the delivery *(SHIPPED)*

The prerequisite for owning a fork: stop loading Scalar from a third-party CDN. `saasuluk/scripts/vendor-scalar.ts`
fetches the **pinned** standalone bundle (`@scalar/api-reference@SCALAR_VERSION/dist/browser/standalone.js`, ~3.59 MB,
verified fully self-contained — 0 runtime chunk/CDN fetches) into `public/vendor/scalar/` at build time (gitignored),
and `/scalar` serves it via `scalarResponse(doc, { cdn: "/vendor/scalar/standalone-<v>.js" })`. Live: `/scalar` makes
**zero** third-party requests; the exact bytes are ours. A future source-patched build drops straight into this slot.

### 3.1 — Patch the source *(remaining — a dedicated dev-env / CI effort)*

**Feasibility checked (concrete):** the source clones cleanly (`github.com/scalar/scalar`, ~121 MB, 6,943 files). Toolchain: **pnpm@10.16.1** + turbo; node 20+. The standalone is `packages/api-reference/src/standalone.ts`, built by `pnpm --filter @scalar/api-reference build` → `vite build -c vite.standalone.config.ts` → `dist/browser/standalone.js`. But api-reference has **18 `@scalar/*` workspace deps** (workspace-store, api-client, components, oas-utils, themes, …), so a build needs the full `pnpm install` (~1 GB) + turbo building that chain — a ~20–30 min operation best run in CI or a persistent dev box, **not inline**. And a *successful* build only reproduces the current bundle; the v4 value is the rewrite below.

**Build attempt (logged, honest):** clone ✓, `corepack`+`pnpm install` ✓ (**2.3 GB** node_modules), but
`build:standalone` (`vite build`) **failed** — vite 8 uses **rolldown@1.0.0-rc.9** (a Rust bundler on a release
candidate) and its native binding errored in the sandbox. So the build needs a **stable CI/dev box with a working
rolldown native binding**, not an inline run. The install working confirms the deps resolve; only the bleeding-edge
bundler is the blocker.

Recipe for the dedicated session:
1. `git clone github.com/scalar/scalar` → vendor into `tooling/ts/vendor/scalar/`; `corepack enable && pnpm install`.
2. Prove the pipeline on a CI box (or pin vite/rolldown to a stable combo): `pnpm --filter @scalar/api-reference build` → drop `dist/browser/standalone.js` into saasuluk's `public/vendor/scalar/` slot (3.0 already serves it). No CDN at all.
3. **`@scalar/openapi-upgrader`**: add a `4.0 ⇄ internal` step (it already chains 2.0→3.0→3.1→3.2; the store even has a `'4.0.0'` placeholder).
3. **`@scalar/workspace-store`** (~1,200 LoC): add Request entities (name = identity), `parameterSchema` model, composition resolution (shared/pathResponses/apiResponses merge).
4. **`@scalar/api-client`** (~300 LoC): try-it consumes `parameterSchema` not `parameters[]`.
5. **`@scalar/api-reference`** components (~700 LoC): operation card shows name + method; parameterSchema panel; facet panels (cost/access) as first-class.
6. **Rebase discipline**: pin upstream, rebase the patch-set on each release; budget ~2–4 hrs/month.

## When to stop

Stop at the earliest phase that satisfies. Phase 1 already gives Scalar the v4 cost/access story. Phase 2 gives a faithful v4 view cheaply. Phase 3 is justified only if we need Scalar's *exact* UI to natively model requests-by-name + parameterSchema — knowing it commits us to the Vue build + the rebase tax in perpetuity.
