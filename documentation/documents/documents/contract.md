[**Suluk**](../../README.md)

***

[Suluk](../../packages.md) / [Registry](../Registry.md) / contract

# Contract keystone — derived v4 OpenAPI + scope facets

**The keystone: one `RouteContract` surface, from which the per-principal v4 doc, the scope gate, the body
gate, and the scope facets every downstream module reads are all DERIVED — so they can never drift.**

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for OpenAPI
> Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable to ratify
> anything on the SIG's behalf. This is an [own-the-code registry module](https://github.com/MahmoodKhalil57/suluk/blob/main/registry/README.md), wired over
> the `@suluk/*` npm packages (the HYBRID pattern, [C050](https://github.com/MahmoodKhalil57/suluk/blob/main/doc/architecture/decisions/C050-registry-distributed-framework.md)/[C052](https://github.com/MahmoodKhalil57/suluk/blob/main/doc/architecture/decisions/C052-npm-vs-registry-boundary.md)).

## Install

```sh
pnpm dlx shadcn@latest add MahmoodKhalil57/suluk/contract
# or:  npx shadcn@latest add MahmoodKhalil57/suluk/contract
```

`registryDependencies` (`app`) are pulled in automatically.

## What you get

Two files drop into your app — a single declared API surface plus the mount that installs its two gates:

- **`src/contract.ts`** (`contract.contract.ts`) — the keystone. It declares the base operation surface as
  `@suluk/hono` `RouteContract`s via `contractDoc(...)` — each op carries a `name` (the v4 by-name handle,
  C009), a `summary`, its `x-suluk-access` `scopes`, and a Zod `request.json` where it takes a body. From
  that single `CONTRACT` it DERIVES everything downstream consumes:
  - **`apiDocument(principal?)`** — the v4 OpenAPI document, projected PER PRINCIPAL. Pass `{ scopes }` and
    `emitV4` hides any operation whose required scopes the caller doesn't hold (the WHO axis); omit it for
    the full public-plus-scoped doc.
  - **`SCOPE_BY_OP`** — op-name → its single required scope; **`PUBLIC_OPS`** — the set of ops needing NO
    scope (health, the pricing catalogs, the signature-verified Stripe webhook). Both derived from the
    contract, so a newly-added scoped route is never accidentally treated as public.
  - **`enforceApiKeyScope`** — the scope gate. A keyed (`x-api-key` / MCP) caller is restricted to the
    scopes the contract declares per op; sessions pass through. `matchRoute` / `scopeForRequest` resolve a
    request to its op with a two-tier match (exact longest-prefix op, then an `/api/<module>` write/read
    fallback) so an undeclared sub-path can never be reached ungated. Denials are RFC-9457 403s.
  - **`validateRequest`** — the body gate. For a write op that declares a `request.json` schema, it parses
    the body and synthesizes an RFC-9457 400 (`ValidationError`, flattened Zod issues) on failure; ops
    without a declared schema pass through, so it only ever tightens declared ops.
- **`src/routes/contract.ts`** (`contract.routes.ts`) — **`mountContract(app)`**: installs
  `enforceApiKeyScope` then `validateRequest` on `/api/*` (a missing-scope 403 precedes a bad-body 400),
  and serves **`GET /api/openapi.json`** — the v4 document projected to the caller's own scopes (anonymous
  → the public surface).

**Stateless — no schema, no provision fragment** ([C052](https://github.com/MahmoodKhalil57/suluk/blob/main/doc/architecture/decisions/C052-npm-vs-registry-boundary.md)). The contract is pure data + derivations.

Editing a route in `CONTRACT` re-projects the doc, the scope map, the two gates, and (downstream) the
`reference` page and the `mcp` tool list together — the contract-first payoff.

## Dependencies

- **npm (`dependencies`):** `@suluk/hono` (`contractDoc`, `emitV4`, `RouteContract` — the derivation
  engine), `@suluk/core` (`toProblemDetails`, `PROBLEM_CONTENT_TYPE`, `OpenAPIv4Document`), `zod`, `hono`.
- **registry (`registryDependencies`):** [`app`](https://github.com/MahmoodKhalil57/suluk/tree/main/registry/app) — the base Hono app the mount attaches to.

Downstream, [`reference`](https://github.com/MahmoodKhalil57/suluk/tree/main/registry/reference) and [`mcp`](https://github.com/MahmoodKhalil57/suluk/tree/main/registry/mcp) list `contract` as a `registryDependency`: both
render/serve over the same `apiDocument()` this module derives.

## Own the wiring, npm the logic

You **own** the wiring: the `CONTRACT` route list (its ops, scopes, and Zod schemas), the two gates'
matching rules, and the mount — all yours to edit. The **derivation** flows from npm: `@suluk/hono`'s
`emitV4` turns the contract × the requesting principal into the v4 document (synthesizing the RFC-9457
error responses and the 401/403 for scoped ops), and `contractDoc` type-checks the surface (documentation
coverage is enforced at the type level). A fix to how the v4 document is emitted arrives via `npm update`;
your declared surface never forks.
