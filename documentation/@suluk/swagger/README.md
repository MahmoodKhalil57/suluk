[**Suluk**](../../README.md)

***

[Suluk](../../packages.md) / @suluk/swagger

<p align="center">
  <a href="https://github.com/MahmoodKhalil57/suluk">
    <img src="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/wordmark.png" alt="Suluk" width="360" />
  </a>
</p>

# @suluk/swagger

**Render an OpenAPI v4 "Suluk" document with Swagger UI — via the automatic 3.1 downgrade.**

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```sh
bun add @suluk/swagger
```

## What it does

Swagger UI only understands OpenAPI 3.x, so this package projects your v4 document **down to 3.1**
(via `@suluk/openapi-compat`) and renders it through Swagger UI.

- **One v4 doc in, a Swagger UI page out.** `swaggerHtml(doc)` returns a self-contained HTML string;
  `swaggerResponse(doc)` returns a `text/html` `Response` for Bun.serve / Hono / fetch handlers.
- **No build step, no asset hosting.** The page loads `swagger-ui-dist` from a CDN (jsDelivr by
  default) and embeds the downgraded spec **inline** — no separate `/openapi.json` round-trip.
- **Downgrade diagnostics.** `swaggerHtml` also returns the `diagnostics` from the v4 → 3.1
  conversion, so you can surface what 3.1 could not represent.
- **CDN pinning / self-hosting.** Pin a `swagger-ui-dist` `version`, or point `cdn` at your own host.
- **XSS-safe embedding.** The inline spec neutralizes `</script>` breakout; the page title is HTML-escaped.

## When to reach for it

Reach for `@suluk/swagger` when a consumer **specifically needs the Swagger UI lens** for your API.
It is one of several docs renderers in the suite — pick by the UI you want:

- **`@suluk/swagger`** (this package) — Swagger UI, through the 3.1 downgrade.
- **`@suluk/reference`** — native v4 docs rendered as server HTML (operation browser, cost explorer,
  access "View-as" lens). Shows what a 3.x renderer structurally cannot.
- **`@suluk/scalar`** — the Scalar API Reference UI, either natively v4 (via the suluk fork) or via the
  3.1 downgrade.
- **`@suluk/editor`** — a client-only authoring surface (CodeMirror + live preview), not a read-only docs page.

If you want native-v4 features (named `requests` maps, `x-suluk-cost` / `x-suluk-access` facets), use
`@suluk/reference` or `@suluk/scalar`'s native path — those facets are lost in the 3.1 downgrade Swagger UI requires.

## Usage

```ts
import { parseDocument } from "@suluk/core";
import { swaggerHtml, swaggerResponse } from "@suluk/swagger";

const doc = parseDocument(yamlOrJsonText); // an OpenAPIv4Document

// As a self-contained HTML string (+ downgrade diagnostics):
const { html, diagnostics } = swaggerHtml(doc);
for (const d of diagnostics) console.warn(d); // what 3.1 could not represent

// As a Response — drop straight into a Bun.serve / Hono / fetch handler:
app.get("/swagger", () => swaggerResponse(doc));
```

### Options

```ts
swaggerHtml(doc, {
  pageTitle: "My API",                                  // browser tab title (default: doc.info.title)
  version: "5.11.0",                                    // pin swagger-ui-dist on the default CDN
  cdn: "https://my.cdn/swagger-ui-dist@5.11.0",         // …or override the CDN base entirely
  configuration: { deepLinking: true, docExpansion: "none" }, // merged into SwaggerUIBundle({ … })
});
```

Real use in [`saasuluk`](https://github.com/MahmoodKhalil57/suluk) — the Swagger view sits next to the
Scalar and native-v4 views, all rendered from the **same** contract:

```ts
app.get("/swagger", () => swaggerResponse(scrubSource(document)));
```

## API

| Export | Signature | What it does |
| --- | --- | --- |
| `swaggerHtml` | `(doc: OpenAPIv4Document, opts?: SwaggerOptions) => RenderResult` | Downgrade to 3.1 and build a self-contained Swagger UI page; returns `{ html, diagnostics }`. |
| `swaggerResponse` | `(doc: OpenAPIv4Document, opts?: SwaggerOptions) => Response` | Same page as a `text/html` `Response`. |
| `SwaggerOptions` | `{ pageTitle?, cdn?, version?, configuration? }` | Render options (type). |
| `RenderResult` | `{ html: string; diagnostics: Diagnostic[] }` | Return type of `swaggerHtml` (type). |

The single entry point is `@suluk/swagger` — there are no sub-path exports and no CLI.

## Boundary

This is an **L3 renderer — it renders, it does not host.** `swaggerHtml`/`swaggerResponse` hand you
HTML you own and serve; nothing here phones home or becomes a runtime you can't control. The Swagger UI
assets load from a CDN you choose (pin `version` or set `cdn` to self-host). The package stays thin on
purpose: the v4 → 3.1 conversion (and its diagnostics) lives in `@suluk/openapi-compat`; this package
only feeds the result to Swagger UI. Serving the page — routing, auth, projecting per-viewer subsets —
stays app-side.

## License

Apache-2.0

## Interfaces

- [RenderResult](interfaces/RenderResult.md)
- [SwaggerOptions](interfaces/SwaggerOptions.md)

## Functions

- [swaggerHtml](functions/swaggerHtml.md)
- [swaggerResponse](functions/swaggerResponse.md)
