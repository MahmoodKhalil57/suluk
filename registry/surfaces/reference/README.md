# API reference — v4-enhanced Scalar page over the derived contract

**A v4-native API reference page rendered with [`@suluk/scalar`](../../tooling/ts/packages/scalar) — our
Scalar taught to show OpenAPI v4 — from the SAME per-principal document the contract keystone derives, so
the docs can never drift from the routes, the scopes, or the cost model.**

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for OpenAPI
> Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable to ratify
> anything on the SIG's behalf. This is an [own-the-code registry module](../README.md), wired over
> the `@suluk/*` npm packages (the HYBRID pattern, [C050](../../doc/architecture/decisions/C050-registry-distributed-framework.md)/[C052](../../doc/architecture/decisions/C052-npm-vs-registry-boundary.md)).

## Install

```sh
pnpm dlx shadcn@latest add MahmoodKhalil57/suluk/reference
# or:  npx shadcn@latest add MahmoodKhalil57/suluk/reference
```

`registryDependencies` (`app`, `contract`) are pulled in automatically.

## What you get

One file drops into your app — the mount that serves the reference page over your derived contract:

- **`src/routes/reference.ts`** (from `reference.routes.ts`) — **`referenceRoutes()`**, a Hono router that
  hands the contract's `apiDocument()` to `@suluk/scalar`'s `scalarV4Response(...)`. It renders the SAME
  v4 document the rest of the platform derives — the one `contract` projects and `mcp` reads — so the docs,
  the routes, the scope gate, and the cost badges can never disagree. Mount it:
  `app.route("/api/reference", referenceRoutes())`. Routes:
  - `GET /api/reference` → the full **v4-enhanced Scalar page** over `apiDocument()`: the pinned suluk-forked
    standalone renders v4 `requests`→operations **natively** (vanilla Scalar would show only Models), with the
    `x-suluk-cost` + `x-suluk-access` facets surfaced as **badges** on each operation, and a **"View as"**
    role projector in the toolbar (Anonymous / Full access).
  - `GET /api/reference/spec` → the **enriched, facet-badged spec** the "View as" toolbar re-fetches when you
    pick a role; `?view=anon` projects `apiDocument({ scopes: [] })` (the public surface only), any other value
    the full document. This is the per-role re-mount source Scalar reads.
  - `GET /api/reference/:tool` → the page **focused on one operation**, addressed by its v4 by-name handle
    (C009 — the key in a pathItem's `requests`). Scalar has no single-op render entry, so the module's owned
    `focusOn(doc, tool)` helper projects the v4 document down to just the pathItem hosting that named request
    and renders THAT (same renderer, one op). An unknown name falls back to the full page — the reference
    always renders something.

**Derived + stateless — no schema, no provision fragment** ([C052](../../doc/architecture/decisions/C052-npm-vs-registry-boundary.md)). The page is a pure function of the
contract: editing a route in `CONTRACT` re-projects `apiDocument()`, and this page re-renders with it.

## Dependencies

**npm (`dependencies`):**

- [`@suluk/scalar`](../../tooling/ts/packages/scalar) — Scalar taught to show v4 (see below); pulls in
  `@suluk/openapi-compat` for the v4→3.1 projection.
- [`@suluk/core`](../../tooling/ts/packages/core) — the `OpenAPIv4Document` type the `focusOn` projection walks
- `hono` — the router

**Registry (`registryDependencies`):**

- [`app`](../app) — the base Hono app the mount attaches to.
- [`contract`](../contract) — the keystone this page renders over; its `apiDocument()` is the document source.

## Own the wiring, npm the logic

You **own** the wiring: the mount path, the three routes, the `focusOn` projection that carves one operation
out of the v4 document, and the `VIEWS` / `principalFor` role map that drives "View as" — all yours to edit.
The **whole renderer is npm**: `@suluk/scalar`'s `scalarV4Response` turns the v4 document into a self-contained
HTML page driven by the pinned suluk-forked Scalar standalone, which ingests v4 `requests`→operations natively
and paints the `x-suluk-cost` / `x-suluk-access` facets as badges — the v4-native view a plain 3.x Scalar can't
render. `enrichedSpec` builds the per-role projection the "View as" toolbar re-mounts from. We never reimplement
the UI; we hand it the doc. A rendering fix (or a whole new v4 feature) arrives via `npm update`; your wiring
never forks. (Deeper native v4 lands in `@suluk/scalar` itself — see its `FORK.md`.)
