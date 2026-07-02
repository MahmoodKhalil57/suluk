---
description: "Render an OpenAPI v4 'Suluk' document with Scalar API Reference — NATIVELY via the suluk fork (Scalar ingests v4, shows 4.0.0-candidate; works out of the box, the fork bundle is served from @suluk/scalar-standalone on jsdelivr-npm) or via the 3.1 downgrade for vanilla Scalar. CANDIDATE tooling."
name: suluk-scalar
---

# @suluk/scalar

Render an OpenAPI v4 'Suluk' document with Scalar API Reference — NATIVELY via the suluk fork (Scalar ingests v4, shows 4.0.0-candidate; works out of the box, the fork bundle is served from @suluk/scalar-standalone on jsdelivr-npm) or via the 3.1 downgrade for vanilla Scalar. CANDIDATE tooling.

## Quick Start

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

## Configuration

2 configuration interfaces — see references/config.md for details.

## Quick Reference

**Functions:** `enrichFacetBadges` (Mutate a downgraded 3), `enrichFacetDetail` (Append the v4 facet detail to each operation's description (progressive disclosure, complementing the badges)), `v4Intro` (Prepend a short "this is a Suluk v4 contract" note (+ a cost-coverage tally) to the doc intro Scalar shows up top), `enrichedSpec` (Project a v4 document to the 3), `enrichV4Facets` (Mutate a v4 document: stamp the facet badges + detail on each REQUEST (the v4 by-name operation) and prepend the
 v4-contract intro — the same superpowers as the 3), `enrichedV4` (Enrich a v4 document with the suluk facets (badges + detail + intro) WITHOUT downgrading — for the forked Scalar
 that ingests v4 NATIVELY), `scalarHtml` (Render a v4 document to a self-contained Scalar HTML page (+ downgrade diagnostics)), `scalarResponse` (Convenience for Bun), `scalarV4Html` (The saasuluk-grade **v4 reference**: the self-hosted Scalar UI fed the v4 doc (faithful + facet-enriched), wrapped
in a suluk toolbar that adds the v4-native "View as" ROLE projector (Anonymous / Signed-in / Admin) — picking a
role re-mounts Scalar with that role's projected spec from `specUrl` — and a link out to the deep native renderer), `scalarV4Response` (The v4 Scalar reference as a text/html Response)
**Types:** `RenderResult`
**Constants:** `SCALAR_VERSION` (We OWN this version (the fork's first act): pin instead of riding `@latest`, so the UI never drifts under us), `SULUK_FORK_STANDALONE_VERSION` (The PINNED suluk-forked Scalar standalone (Scalar + the v4 patch-set), published as `@suluk/scalar-standalone` and
served from jsdelivr-npm), `SULUK_FORK_CDN`

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`
- When configuring options → read `references/config.md` for all settings and defaults

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)