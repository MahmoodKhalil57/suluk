[**Suluk**](../../README.md)

***

[Suluk](../../packages.md) / @suluk/hono

<p align="center">
  <a href="https://github.com/MahmoodKhalil57/suluk">
    <img src="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/wordmark.png" alt="Suluk" width="360" />
  </a>
</p>

<h1 align="center">@suluk/hono</h1>

<p align="center"><b>The derivation engine: author minimal Hono+Zod route contracts; everything else — the v4 doc, validation, contract tests, a doc-coverage audit, and on-the-wire access + rate-limit enforcement — is derived.</b></p>

---

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```sh
bun add @suluk/hono
```

Peer deps you supply: `hono`, `zod` (v4), and `@hono/zod-validator`.

## What it does

You author one thing — an array of `RouteContract`s (a Hono path + method + Zod schemas). From that single source, `@suluk/hono` projects:

- **The v4 document** — `emitV4(routes, ctx)`. Not a static file: the document is a pure function of the contracts × the requesting principal (the *who* — scope filtering) × time (the *when* — `deprecatedSince`/`removedSince`). It also synthesizes RFC-9457 error responses + a shared `ProblemDetails` schema.
- **The live app** — `mount(app, routes)`, the only file that touches Hono. Request validation is derived from the same Zod schemas, so the doc and the running server cannot drift.
- **Contract tests** — `runContractChecks(routes)` auto-generates checks (every schema is valid JSON Schema 2020-12, every example satisfies its schema, the emitted document passes the meta-schema, no two routes provably collide).
- **A doc-coverage audit** — `audit(doc)` / `coverage(doc)` flag under-documented operations (advisory, never a gate); `autofill(doc)` fills the obvious gaps.
- **Server-side authorization** — the row-level CRUD engine (`gate` / `policyFor` / `DEFAULT_POLICIES`) plus facet-driven, fail-closed wire middleware (`enforceAccess`, `enforceRateLimit`) and a typed RFC-9457 error model (`HttpErrors` + `onError`).

## When to reach for it

Reach for `@suluk/hono` when you are **defining HTTP routes** and want the contract, the v4 document, request validation, and access/rate-limit enforcement to all *derive* from one declaration rather than being maintained by hand.

It is the producer end of the Suluk walk — the thing the rest of the toolchain consumes. The v4 document it emits is what `@suluk/scalar`, `@suluk/swagger`, `@suluk/reference`, `@suluk/sdk`, and `@suluk/testgen` project out. If you already *have* a v4 document and only want to render or generate from it, reach for those packages instead.

`enforceAccess` / `enforceRateLimit` are the **only** server-side enforcement home — Suluk's `x-suluk-*` facets are advisory, so without this middleware an access facet on a custom op is decorative. Apply these to make every operation's facet load-bearing on the wire.

## Usage

### 1. Author contracts → emit the v4 document

```ts
import * as z from "zod";
import { contract, emitV4 } from "@suluk/hono";

const Pet = z.object({ id: z.number().int().optional(), name: z.string().min(1), tags: z.array(z.string()) });

const routes = contract([
  {
    method: "get", path: "/pet", name: "listPets",
    summary: "List pets", tags: ["pets"],
    responses: [{ status: 200, description: "ok", schema: z.array(Pet) }],
  },
  {
    method: "post", path: "/pet", name: "createPet",
    summary: "Create a pet", scopes: ["write:pets"],
    request: { json: Pet, examples: [{ name: "Rex", tags: [] }] },
    responses: [{ status: 201, description: "created", schema: Pet }],
  },
  {
    method: "get", path: "/pet/:petId", name: "getPet",
    summary: "Get a pet by id",
    request: { params: z.object({ petId: z.string() }) },
    responses: [{ status: 200, description: "ok", schema: Pet }],
  },
]);

const { document, diagnostics } = emitV4(routes, { info: { title: "Pets", version: "1.0.0" } });
// `document` is a v4 (4.0.0-candidate) OpenAPIv4Document — Hono ":petId" became uriTemplate "pet/{petId}".
```

### 2. The document is a function of *who* + *when*

```ts
// WHO — a principal is filtered to the operations whose required scopes it holds:
emitV4(routes, { principal: { scopes: [] } });            // createPet (requires write:pets) is omitted
emitV4(routes, { principal: { scopes: ["write:pets"] } }); // createPet is included
emitV4(routes);                                            // no principal ⇒ the full public doc

// WHEN — `now` drives deprecatedSince/removedSince:
emitV4(routes, { now: "2031-06-01" });   // a route past its removedSince is hidden
// a route past deprecatedSince (but before removedSince) stays, marked `deprecated: true`.

// Map scopes onto a security scheme to synthesize 401/403 + security requirements:
emitV4(routes, { securityScheme: "bearerAuth", securitySchemes: { bearerAuth: { type: "http", scheme: "bearer" } } });
```

### 3. Mount the same contracts onto a live Hono app

```ts
import { Hono } from "hono";
import { mount } from "@suluk/hono";

// each contract's `handler` is wired with @hono/zod-validator derived from its own schemas.
const app = mount(new Hono(), routes);
// POST /pet with { name: "" } → 400 (name.min(1) fails); valid body → the handler runs.
```

### 4. Contract tests + the coverage audit

```ts
import { runContractChecks, audit, coverage, autofill } from "@suluk/hono";

const run = runContractChecks(routes);
// run.total / run.passed / run.failures — wire this into `bun test` or CI.

const { document } = emitV4(routes);
audit(document);              // Finding[] — under-documented operations (advisory)
coverage(document);           // a [0,1] score; 1 = no warn-level gaps
coverage(autofill(document)); // autofill synthesizes summaries/descriptions → raises coverage
```

### 5. Server-side enforcement (the wire is the boundary)

`enforceAccess` reads each operation's declared `x-suluk-access` and enforces it; identity is **injected** (you own your principal/scope model). It is **fail-closed** — a missing facet denies by default, an unknown/mis-cased `requires` denies, a named scope is enforced even under `requires: "anyone"`.

```ts
import { enforceAccess, enforceRateLimit } from "@suluk/hono";

app.use("*", enforceAccess({
  operationOf: (c) => /* resolve the contract op for this request */ resolveOp(c),
  accessOf: (op) => accessFacets[op],   // the op's x-suluk-access ({ requires, scope })
  principal: (c) => c.get("userId") ?? null,
  isAdmin: (c) => c.get("isAdmin") === true,
  scopes: (c) => c.get("scopes"),
}));

app.use("*", enforceRateLimit({
  operationOf: (c) => resolveOp(c),
  rateLimitOf: (op) => budgets[op],      // the op's x-suluk-ratelimit ({ windowMs, maxRequests, key })
  defaultFacet: { windowMs: 60_000, maxRequests: 300, key: "ip" }, // blanket floor (default: unmetered)
}));
```

For hand-applied per-route gating instead of one blanket middleware, use `createGuard`:

```ts
import { createGuard } from "@suluk/hono";

const guard = createGuard({ principal: (c) => c.get("userId") ?? null, isAdmin: (c) => c.get("isAdmin") === true });
app.get("/me",     guard.requireAuth, handler);                 // 401 unless signed in
app.get("/admin",  guard.requireAdmin, handler);                // 401 anon, 403 non-admin
app.post("/write", guard.requireScopes("write:pets"), handler); // 403 unless holds every scope
```

### 6. The row-level CRUD access engine

`gate` is pure (no Hono `Context`) — it decides whether a caller may run a CRUD op and whether the query should be scoped to their own rows. `ruleToRequires` projects the same rule onto the wire `requires` level, so one declaration drives both the gate and the `x-suluk-access` facet.

```ts
import { gate, policyFor, ruleToRequires, DEFAULT_POLICIES } from "@suluk/hono";

const policy = policyFor("owned");                  // one of 7 modes in DEFAULT_POLICIES (or pass your own matrix)
const decision = gate(policy.update, { isAdmin: false, principal: "user_123" });
// → { ok: true, scopeOwner: true }  — signed-in caller may update, scoped to their own rows; admin sees all.

ruleToRequires("owner"); // "authenticated"  — feeds the same op's x-suluk-access facet/docs
```

### 7. Typed errors → RFC-9457 on the wire

```ts
import { Hono } from "hono";
import { HttpErrors, onError } from "@suluk/hono";

const app = new Hono();
app.onError(onError());                       // maps a thrown SulukHttpError → its status + problem+json body
app.get("/pet/:id", (c) => {
  throw HttpErrors.notFound("Pet", c.req.param("id")); // → 404 { status, title, detail, instance, error }
});
// An untyped throw becomes a 500 defect; its cause is logged server-side, never leaked on the wire.
// HttpErrors.rateLimited(ms) additionally emits a Retry-After header.
```

## API

| Export | What it does |
| --- | --- |
| `contract` / `responseList` | identity helper to author a `RouteContract[]` with literal inference; normalize a responses list/map |
| `emitV4` | project contracts → a v4 document for a given principal (`who`) + time (`when`) |
| `mount` | wire the same contracts onto a live Hono app (the only Hono-touching file) |
| `audit` / `coverage` / `autofill` | doc-coverage findings, a `[0,1]` score, gap-filling |
| `contractChecks` / `runContractChecks` | auto-generated contract tests (schema-valid, example⊨schema, meta-schema, no collisions) |
| `validateSchema2020` | assert a value is well-formed JSON Schema 2020-12 |
| `enforceAccess` / `createGuard` | facet-driven wire authz middleware; explicit per-route guards |
| `gate` / `policyFor` / `ruleToRequires` / `DEFAULT_POLICIES` | the pure row-level CRUD access engine |
| `enforceRateLimit` / `MemoryRateLimitStore` | facet-driven fixed-window rate limiting (swappable store) |
| `SulukHttpError` / `HttpErrors` / `onError` | the typed, throwable RFC-9457 error model + the Hono error handler |

## Boundary

This is the **producer** end of the projection — *contract in → v4 document + a mounted app out*. It renders and generates; it does **not** host. The seams are injected:

- **Identity is injected.** `enforceAccess` / `createGuard` never trust a header they didn't verify — your `principal` / `isAdmin` / `scopes` callbacks own that (Better Auth session, API token, etc.).
- **The rate-limit store is a swappable binding.** `MemoryRateLimitStore` is a per-process **dev default only**. The durable production store (KV / Durable Object) lives app-side / in `@suluk/deploy`.
- **Row scoping stays app-side.** `gate` tells you *whether* to scope to the owner; your CRUD layer applies that to the actual query.

Access enforcement is the one server-side enforcement home — new enforcement primitives or access modes belong here; apps keep their per-op access/budget tables as plain data.

## License

Apache-2.0

## Classes

- [MemoryRateLimitStore](classes/MemoryRateLimitStore.md)
- [SulukHttpError](classes/SulukHttpError.md)

## Interfaces

- [AccessFacet](interfaces/AccessFacet.md)
- [Check](interfaces/Check.md)
- [CheckRun](interfaces/CheckRun.md)
- [EmitContext](interfaces/EmitContext.md)
- [EmitDiagnostic](interfaces/EmitDiagnostic.md)
- [EmitResult](interfaces/EmitResult.md)
- [EnforceAccessConfig](interfaces/EnforceAccessConfig.md)
- [EnforceRateLimitConfig](interfaces/EnforceRateLimitConfig.md)
- [Finding](interfaces/Finding.md)
- [GateDecision](interfaces/GateDecision.md)
- [GateIdentity](interfaces/GateIdentity.md)
- [Guard](interfaces/Guard.md)
- [IdentityConfig](interfaces/IdentityConfig.md)
- [OnErrorOptions](interfaces/OnErrorOptions.md)
- [Policy](interfaces/Policy.md)
- [RateLimitConsumeOptions](interfaces/RateLimitConsumeOptions.md)
- [RateLimitResult](interfaces/RateLimitResult.md)
- [RateLimitStore](interfaces/RateLimitStore.md)
- [RouteContract](interfaces/RouteContract.md)
- [RouteRequest](interfaces/RouteRequest.md)
- [RouteResponse](interfaces/RouteResponse.md)
- [SchemaCheck](interfaces/SchemaCheck.md)
- [SulukHttpErrorInit](interfaces/SulukHttpErrorInit.md)

## Type Aliases

- [AccessMode](type-aliases/AccessMode.md)
- [AccessRequires](type-aliases/AccessRequires.md)
- [DocumentedRoute](type-aliases/DocumentedRoute.md)
- [Method](type-aliases/Method.md)
- [Rule](type-aliases/Rule.md)

## Variables

- [DEFAULT\_POLICIES](variables/DEFAULT_POLICIES.md)
- [HttpErrors](variables/HttpErrors.md)

## Functions

- [audit](functions/audit.md)
- [autofill](functions/autofill.md)
- [contract](functions/contract.md)
- [contractChecks](functions/contractChecks.md)
- [contractDoc](functions/contractDoc.md)
- [coverage](functions/coverage.md)
- [createGuard](functions/createGuard.md)
- [emitV4](functions/emitV4.md)
- [enforceAccess](functions/enforceAccess.md)
- [enforceRateLimit](functions/enforceRateLimit.md)
- [gate](functions/gate.md)
- [mount](functions/mount.md)
- [onError](functions/onError.md)
- [policyFor](functions/policyFor.md)
- [responseList](functions/responseList.md)
- [ruleToRequires](functions/ruleToRequires.md)
- [runContractChecks](functions/runContractChecks.md)
- [validateSchema2020](functions/validateSchema2020.md)
