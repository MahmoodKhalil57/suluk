# C33. The Suluk v4 editor — a thin static shell over our existing fork, not a fork of scalar-app

> **Provenance:** Candidate-fork ADR (Suluk), not a SIG decision. Decides how we build a public, native-v4 editor
> (the editor.scalar.com analog) at **editor.suluk.saastemly.com**, given that we *already own* the hard part — the
> v4-native render fork. Reached by a **grill-with-docs interview** (this session, 2026-06-14): six load-bearing
> questions, each answered by the operator. Grounded in two read-only priors: the upstream `scalar/scalar` monorepo
> (MIT) and our own `tooling/ts/scalar-fork/` patch pipeline.

Date: 2026-06-14

## Status

Accepted (candidate-fork). Decision ceiling **0.82** — the boundary is well-supported (we control the render fork
and all of validate/harden/enrich are pure, Workers-/browser-safe JS), but it is an N=1 build bet: the client-only
"superpowers in the browser" assumption is validated by the *shape* of `@suluk/reference` (pure HTML-returning
functions) yet not yet by a shipped bundle.

## Context

The operator wants an authoring surface like **editor.scalar.com** — a two-pane app (code editor left, live API
reference right, diagnostics below) — hosted at **editor.suluk.saastemly.com** and wired to render our **native
OpenAPI v4** ("Moonwalk"/Suluk candidate) documents, not just 3.1.

The naïve reading ("fork the Scalar editor") is expensive and redundant once you map what exists:

- **editor.scalar.com is a heavy product.** Its source is `projects/scalar-app` — a Vue 3 + Vite + **Electron** app,
  Monaco-based, tightly coupled to Scalar's internal `workspace-store`. The old embeddable `@scalar/api-reference-editor`
  component has been **removed** from the current monorepo. Forking it means re-doing v4 support against a second,
  heavier package surface and fighting Electron baggage to host as a static site.
- **We already own the invasive part.** `tooling/ts/scalar-fork/` clones upstream and applies `patches/*.patch` →
  `dist/standalone-suluk.js` (committed, ~3.6 MB). Patches **0003** (`project-v4-to-store.ts`) and **0006**
  (multi-request) already teach Scalar to ingest the v4 shape *natively* — named `requests` maps, `parameterSchema`,
  the `4.0.0-candidate` badge, even two requests sharing a method on one path. That is precisely the
  "method-keyed shape baked across workspace-store → sidebar → api-reference" that research flagged as the hard part.
- **The diagnostics surface already exists.** `@suluk/core` `validateDocument(doc) → {valid, errors[]}`,
  `@suluk/harden` `auditDocument(doc) → A–F grades + findings`, `@suluk/compat` `upgrade()/downgrade()`. All pure JS.
- **The "superpowers" are pure functions.** `@suluk/reference` exports `costExplorer`, `hardeningPanel`,
  `referenceInsightsHtml`, etc. — they *return HTML strings*, so they run in the browser, not just on a Worker.

So an "editor" for us is not a fork of anyone's editor. It is: **a CodeMirror pane + our existing `standalone-suluk.js`
as the live preview + diagnostics/superpowers we already emit, wired by a little glue.** The only genuinely missing
piece is the *shell*.

## Decision

Build a new reusable package **`@suluk/editor`** (in the suluk monorepo) and deploy a thin consumer site at
**editor.suluk.saastemly.com**. The six decisions that define it (each from the interview):

1. **Thin shell, fork nothing new.** Reuse `standalone-suluk.js` as the preview engine; do not fork `scalar-app`.
2. **Fully static, client-only.** The page does parse → validate → harden → `enrichV4` → re-mount entirely in the
   browser; Cloudflare serves static assets only. No `/api`, no per-keystroke round-trips. Mirrors editor.scalar.com's
   local-first model and is the most forkable by the community.
3. **CodeMirror 6** for the left pane — lighter than Monaco, trivial `bun build` ESM bundling, and a `linter()` gutter
   that maps directly onto our `{path,message}` diagnostics.
4. **Both formats, JSON-first** — default JSON (matches the projection output and every `@suluk` endpoint), YAML toggle
   via one small browser parser; both parse to one object before validate/render.
5. **Full v1 feature set:** 3.1→v4 upgrade (`@suluk/compat`, with an honest v4→3.1 downgrade preview that surfaces
   collision diagnostics), seed examples + `?url=` remote load, v4 superpowers in the preview (cost explorer,
   View-as lens, A–F hardening grade — all client-side), and share-permalink (doc in URL hash) + localStorage autosave.
6. **Packaged for reuse:** `@suluk/editor` exports `editorHtml()/editorResponse()` and ships the built client bundle;
   the deployed site is a thin consumer. Anyone can self-host their own native-v4 editor with one import.

Preview wiring reuses the exact init the reference already uses: `Scalar.createApiReference('#preview', { content })`,
re-mounted (clear node + call again) on each debounced edit.

The editor belongs to the **candidate-spec project** (the `suluk` subdomain), not the ecommerce demo
(`saasuluk.saastemly.com`) — deployed as its own Cloudflare static site via `@suluk/cloudflare` `deployWith` to a
dedicated script + `editor.suluk.saastemly.com` custom-domain route.

## Consequences

**Easier.**
- One fork to maintain, not two. The `scalar-fork` patch pipeline already produces the preview engine; the editor adds
  no new upstream-coupled patch target. Upstream Scalar bumps cost the same as today.
- The editor becomes a *showcase* for the candidate: it can only render features (multi-request, cost/access facets)
  that a 3.x editor structurally cannot — a concrete, linkable argument for v4 and a growth-campaign asset.
- Reuses validate/harden/compat/reference verbatim, in the browser. No new validation logic; one source of truth.
- `@suluk/editor` is community-installable — consistent with "contracts in, everything derived."

**Harder / accepted costs.**
- The preview is bounded by the fork's lossy boundary: features the fork can't yet show won't appear in preview even
  if valid in the source (today: zero such cases in practice; multi-request is handled by patch 0006).
- "View-as" projection client-side needs a browser projector; if not wired in v1 it degrades to showing the full doc.
- Shipping `standalone-suluk.js` (~3.6 MB) as a static asset of the editor site — acceptable for an authoring tool,
  cached immutably.
- Branding hygiene: the shell is Suluk-branded; we retain upstream Scalar's MIT notice and in-component attribution
  (gracious + license-clean), rather than stripping marks from the rendered reference.

**Rejected alternatives.** Fork `scalar-app` wholesale (Vue+Electron weight, second v4 patch target, not Workers-native);
extend the patch pipeline to also build scalar-app's web entrypoint (same heaviness, second patch surface). Both lose to
the thin shell because the app shell is the *cheap* part to build and the render fork — the expensive part — is already done.
