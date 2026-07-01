# API reference — v4-native page over the derived contract

**A native-v4 API reference page, rendered from the SAME per-principal document the contract keystone
derives — so the docs can never drift from the routes, the scopes, or the cost model.**

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
  hands the contract's `apiDocument()` to `@suluk/reference`'s `referenceResponse(...)`. It renders the SAME
  v4 document the rest of the platform derives — the one `contract` projects and `mcp` reads — so the docs,
  the routes, the scope gate, and the cost badges can never disagree. Mount it:
  `app.route("/api/reference", referenceRoutes())`. Routes:
  - `GET /api/reference` → the full reference over `apiDocument()` (every declared operation, with cost
    badges, the access "View-as" projection, the hardening grade, and the in-page try-it executor).
  - `GET /api/reference/:tool` → the reference FOCUSED on one operation, addressed by its v4 by-name handle
    (C009 — the key in a pathItem's `requests`). `@suluk/reference` has no single-op render entry, so the
    module's owned `focusOn(doc, tool)` helper projects the v4 document down to just the pathItem hosting
    that named request and renders THAT (same renderer, one op). An unknown name falls back to the full
    page — the reference always renders something.

**Derived + stateless — no schema, no provision fragment** ([C052](../../doc/architecture/decisions/C052-npm-vs-registry-boundary.md)). The page is a pure function of the
contract: editing a route in `CONTRACT` re-projects `apiDocument()`, and this page re-renders with it.

## Dependencies

**npm (`dependencies`):**

- [`@suluk/reference`](../../tooling/ts/packages/reference) — the complete v4-native renderer (see below)
- [`@suluk/core`](../../tooling/ts/packages/core) — the `OpenAPIv4Document` type the `focusOn` projection walks
- `hono` — the router

**Registry (`registryDependencies`):**

- [`app`](../app) — the base Hono app the mount attaches to.
- [`contract`](../contract) — the keystone this page renders over; its `apiDocument()` is the document source.

## Own the wiring, npm the logic

You **own** the wiring: the mount path, the two routes, and the `focusOn` projection that carves one operation
out of the v4 document — all yours to edit. The **whole renderer is npm**: `@suluk/reference`'s
`referenceResponse` turns the v4 document into self-contained server HTML (inlined CSS + JS, no client build,
no CDN, Workers-safe) with the v4-native facets a 3.x tool can't host — the `x-suluk-cost` badge + coverage
rollup + declared-vs-actual drift, the `x-suluk-access` "View-as" lens + reachability matrix, signature
collisions over requests that share a method, and an A–F input-hardening grade per op. We never reimplement
the HTML; we hand it the doc. A rendering fix (or a whole new v4 facet) arrives via `npm update`; your wiring
never forks.
