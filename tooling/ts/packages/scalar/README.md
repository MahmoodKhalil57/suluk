<p align="center">
  <a href="https://github.com/MahmoodKhalil57/suluk">
    <img src="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/wordmark.png" alt="Suluk" width="360" />
  </a>
</p>

<h1 align="center">@suluk/scalar</h1>

<p align="center"><b>Render an OpenAPI v4 'Suluk' document with the Scalar API Reference UI — natively as v4, or downgraded for vanilla Scalar.</b></p>

<p align="center">
  <em>Part of <a href="https://github.com/MahmoodKhalil57/suluk">Suluk</a> — one typed OpenAPI v4 contract projecting into every full-stack layer.</em>
</p>

---

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```sh
bun add @suluk/scalar
```

## What it does

Takes a parsed v4 document and returns a self-contained Scalar API Reference HTML page (string or `Response`) — no build step, no server-side React. Two tracks:

- **Native v4 (`scalarV4*`).** Feeds the v4 doc *as v4* to the suluk-forked Scalar standalone, which projects `requests`→operations internally, shows the `4.0.0-candidate` version badge, and renders the v4-only shapes (multi-request-per-method, request-name identity via `showOperationId`). The fork bundle is served from `@suluk/scalar-standalone` on jsDelivr by default, so it works out of the box.
- **3.1 downgrade (`scalar*`).** Projects the v4 doc down to OpenAPI 3.1 (via `@suluk/openapi-compat`) and feeds it to vanilla Scalar — the baseline view that runs against any pinned upstream Scalar bundle.
- **v4 facets, surfaced either way.** `x-suluk-cost` and `x-suluk-access` become Scalar `x-badges` rendered on each operation; expanding an operation reveals the cost breakdown by source + the access rule; a "Suluk v4 contract" intro with a cost-coverage tally is prepended to the doc description.
- **Pinned, never `@latest`.** `SCALAR_VERSION` and `SULUK_FORK_CDN` are exported so the UI never drifts under you; override `cdn` to self-host the bytes.

## When to reach for it

Reach for `@suluk/scalar` when you want the **Scalar** UI for your contract. Use `scalarV4Response` for the full native-v4 reference (badges, the "View as" role projector, an insights drawer); use `scalarResponse` for a plain, dependency-light 3.1 fallback.

Siblings for the same job:

- `@suluk/reference` — the **native** v4 renderer (suluk's own UI, not Scalar's chrome).
- `@suluk/swagger` — render via **Swagger UI** (always through the 3.1 downgrade).
- `@suluk/editor` — an editable two-pane authoring surface (uses this package for its live preview).

## Usage

### Native v4 reference (the common case)

```ts
import { scalarV4Response } from "@suluk/scalar";
import type { OpenAPIv4Document } from "@suluk/core";

// In a Bun.serve / Hono / fetch handler:
app.get("/reference", () =>
  scalarV4Response(document, {
    pageTitle: "saasuluk — OpenAPI v4 reference",
    brand: "saasuluk",
    // optional: a per-role "View as" projector wired to an endpoint that returns the projected spec
    specUrl: "/reference/spec",
    views: [
      { label: "Anonymous", value: "anon" },
      { label: "Signed-in", value: "user" },
      { label: "Admin", value: "admin" },
    ],
    // optional: an embeddable superpowers panel opened as an in-page drawer
    insightsUrl: "/reference/insights",
  }),
);

// Picking a role re-fetches the projected spec and re-mounts Scalar:
app.get("/reference/spec", (c) => c.json(enrichedV4(projectFor(c)).spec));
```

`scalarV4Response` defaults `cdn` to the published fork (`SULUK_FORK_CDN`). To self-host, vendor the fork bundle and pass `cdn`:

```ts
scalarV4Response(document, { cdn: "/vendor/scalar/standalone-suluk.js", brand: "saasuluk" });
```

### Vanilla Scalar via the 3.1 downgrade (the baseline)

```ts
import { scalarResponse, SCALAR_VERSION } from "@suluk/scalar";

app.get("/scalar", () =>
  scalarResponse(document, {
    cdn: `/vendor/scalar/standalone-${SCALAR_VERSION}.js`, // or omit for the jsDelivr default
    facetBadges: false, // plain 4→3 downgrade, no suluk superpowers
  }),
);
```

### As a string

Both renderers have an HTML-string sibling (`scalarV4Html`, `scalarHtml`) returning `{ html, diagnostics }`, where `diagnostics` are the lossy-conversion notes from the v4→3.1 downgrade (the native-v4 path produces none):

```ts
import { scalarHtml } from "@suluk/scalar";

const { html, diagnostics } = scalarHtml(document, { facetBadges: false });
if (diagnostics.length) console.warn("downgrade losses:", diagnostics);
```

### Enrich a spec without rendering a page

When you need the facet-enriched spec object (e.g. to serve as JSON for the "View as" endpoint above), use the `enriched*` helpers directly:

```ts
import { enrichedV4, enrichedSpec } from "@suluk/scalar";

const { spec } = enrichedV4(document);             // v4 shape, badges + detail stamped, NOT downgraded
const { spec, diagnostics } = enrichedSpec(document); // downgraded to 3.1, then facet-enriched
```

Neither mutates the input document. Pass `{ facetBadges: false }` to skip the cost/access enrichment.

## API

| Export | What it does |
| --- | --- |
| `scalarV4Response(doc, opts?)` | Native-v4 Scalar page as a `text/html` `Response` (the fork). |
| `scalarV4Html(doc, opts?)` | Same, as `{ html, diagnostics }`. |
| `scalarResponse(doc, opts?)` | 3.1-downgrade Scalar page as a `Response` (vanilla Scalar). |
| `scalarHtml(doc, opts?)` | Same, as `{ html, diagnostics }`. |
| `enrichedV4(doc, opts?)` | `{ spec }` — v4 doc enriched with facet badges/detail/intro, no downgrade. |
| `enrichedSpec(doc, opts?)` | `{ spec, diagnostics }` — downgraded to 3.1, then facet-enriched. |
| `enrichFacetBadges(spec)` | Mutate a 3.1 spec: attach `x-badges` from `x-suluk-cost`/`x-suluk-access`. |
| `enrichFacetDetail(spec)` | Mutate a 3.1 spec: append the cost/access detail to each op's description. |
| `enrichV4Facets(doc)` | Mutate a **v4** doc: stamp badges + detail on each `request` + the intro. |
| `v4Intro(spec)` | Prepend the "Suluk v4 contract" note + cost-coverage tally to `info.description`. |
| `SCALAR_VERSION` | The pinned upstream Scalar version (string). |
| `SULUK_FORK_CDN` / `SULUK_FORK_STANDALONE_VERSION` | The default fork-bundle CDN URL + its version. |

Key `opts` (full set in `ScalarOptions` / `ScalarV4Options`): `pageTitle`, `cdn`, `facetBadges`, `customCss`, `configuration` (merged into `createApiReference`); and for the v4 reference: `brand`, `specUrl` / `specParam` / `views` (the role projector), `insightsUrl` / `insightsLabel` (the drawer).

## Boundary

This package only **renders** — the L3 line: render/generate, never host. It takes a doc you already parsed and validated and hands back HTML; it never fetches your spec, owns your routes, or mounts a server. You inject the doc (and, for the role projector, the endpoint that returns each role's projected spec).

It also does not *fork* Scalar. The patched standalone — the part that teaches Scalar the native v4 shapes — lives at `tooling/ts/scalar-fork/` (`clone-upstream + patches/*.patch → standalone-suluk.js`, see `FORK.md`); this package only *feeds* that bundle and surfaces the `x-suluk-*` facets as badges. To teach Scalar a new v4 shape, add a patch there, not here.

## License

Apache-2.0
