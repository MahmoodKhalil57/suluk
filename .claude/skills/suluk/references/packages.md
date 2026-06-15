# The `@suluk/*` package catalog — how & when to use, and where to contribute

All packages live in `tooling/ts/packages/<name>/`, are `type: module`, ship **TS source** as `main`
(`src/index.ts`), are Apache-2.0, and are consumed by apps as **published npm packages** (not workspace symlinks).
Each entry below: **What** · **When to reach for it** · **Entry points** (real exports) · **Contribute** (the
extension seam / what's half-built). For deeper API, read the package's `src/index.ts` + `README.md` — those are
ground truth; this catalog is the map.

> The projection chain (keep this mental model):
> **`@suluk/drizzle` / `@suluk/hono` / `@suluk/zod`  →  the v4 document  →  `@suluk/{sdk, panel, scalar, reference,
> swagger, testgen, mcp, nano-stores, shadcn, cost, harden, mcp}`.** Contract IN on the left, everything projected
> OUT on the right. If you're hand-writing something on the right, you're probably fighting the framework.

## "I need X → reach for Y" (quick index)

| I need to… | Package(s) |
|---|---|
| Turn a DB schema into a contract + CRUD | `@suluk/drizzle` |
| Turn Hono+Zod routes into the v4 doc + validation + tests | `@suluk/hono` |
| Convert Zod ⇄ v4 Schema Objects | `@suluk/zod` |
| Compose a whole app from tiered building blocks | `@suluk/builder` |
| Wire auth (Better Auth) into the contract | `@suluk/better-auth` |
| Render API docs (native v4 / Scalar / Swagger / editable) | `@suluk/reference`, `@suluk/scalar`, `@suluk/swagger`, `@suluk/editor` |
| Generate a typed client SDK | `@suluk/sdk` |
| Generate typed client stores | `@suluk/nano-stores` |
| Generate admin panels / forms / tables | `@suluk/panel`, `@suluk/shadcn` |
| Generate a conformance test suite | `@suluk/testgen` |
| Expose the API to LLMs as tools | `@suluk/mcp`, `@suluk/agents` |
| Declare + meter per-operation cost | `@suluk/cost` |
| Audit / harden input schemas | `@suluk/harden` |
| Send branded email / localize / theme / SEO | `@suluk/email`, `@suluk/i18n`, `@suluk/theme`, `@suluk/seo` |
| Manage config + secrets | `@suluk/env` |
| Billing / payments | `@suluk/stripe` |
| Provision + deploy to Cloudflare | `@suluk/cloudflare`, `@suluk/deploy` |
| Validate / parse / match the v4 doc itself | `@suluk/core`, `@suluk/openapi-compat` |
| 3.1 ⇄ v4 conversion | `@suluk/openapi-compat` |

---

## Family 1 — Contract core (the v4 document itself)

### `@suluk/core`
- **What:** parse, validate, resolve, signature, ADA (collision) detection, and path matching for v4 documents.
- **When:** any time you handle a v4 doc as data — validating user/generated input, resolving `$ref`, computing
  operation identity, matching a request to an operation.
- **Entry:** `parseDocument`, `validateDocument(doc) → {valid, errors[]}`, `isValidDocument`, `computeSignature`,
  `collide`, `compileTemplate`, `matchPath`, `scrubSource`, `sourceIndex`/`sourceCoverage`, `rateLimitIndex`.
- **Contribute:** the validator is a precompiled AJV standalone (Workers-safe — keep it that way; never add dynamic
  codegen). New structural rules of the spec go here, behind the meta-schema.

### `@suluk/zod`
- **What:** lossless-where-representable Zod ⇄ v4 Schema Object (JSON Schema 2020-12) conversion. Zod is the source.
- **When:** you have Zod schemas and need v4 Schema Objects (or back). The backbone of `@suluk/hono`/`@suluk/drizzle`.
- **Entry:** `zodToV4`, `v4ToZod`, `ZodToV4Result`, `lexicalSchema` (rich-text).
- **Contribute:** unrepresentable Zod constructs should round-trip *lossily-but-honestly* (report, don't silently
  drop). Add new mappings here, not in callers.

### `@suluk/openapi-compat`
- **What:** lossless-where-possible v4 ⇄ OpenAPI 3.1 conversion (3.1 is what Scalar/Swagger consume).
- **When:** ingesting a 3.1 doc (→ v4) or emitting 3.1 for a 3.x tool; the "Upgrade from 3.1"/"Show as 3.1" flows.
- **Entry:** `upgrade(doc31) → v4`, `downgrade(v4) → {document, diagnostics}`, `validate31`.
- **Contribute:** `downgrade` must emit an **honest diagnostic** for anything 3.1 can't express (e.g. two requests
  sharing a method on one path). Never silently lose data — extend the diagnostics, not the silence.

## Family 2 — Derivation engines (contract IN → v4 OUT)

### `@suluk/drizzle`
- **What:** Drizzle ORM schema → v4 contract (table → drizzle-zod → v4 Schema Objects + metadata), generated CRUD
  route contracts, a driver-agnostic CRUD handler factory, the DDL generator, and the once-only CAS primitives.
- **When:** your data model is Drizzle. This is the on-ramp for any DB-backed Suluk app.
- **Entry:** `crudHandlers(table, opts)` (ONE async factory for dev bun:sqlite *and* prod D1), `claimOnce`/`claimRows`/
  `rowsChanged` (race-safe compare-and-set), `schemaDDL`/`tableDDL`, `tableMetadata`.
- **Contribute:** the CRUD/CAS skeleton is generic *mechanism*; the order/money *machine* stays app-side (N=1 policy).
  New driver-agnostic query mechanics belong here; keep terminals explicitly awaited (D1 parity by construction).

### `@suluk/hono`
- **What:** the derivation engine — minimal Hono+Zod `RouteContract`s in; out comes the v4 doc (dynamic per
  principal+time), request validation, contract tests, a doc-coverage audit, **and** the row-level access engine
  (`gate`/`policyFor`) + on-the-wire `enforceAccess`.
- **When:** you're defining routes and want the contract + validation + enforcement to derive from them.
- **Entry:** `gate(rule, {isAdmin, principal})`, `policyFor`, `ruleToRequires`, `DEFAULT_POLICIES` (7 access modes),
  `enforceAccess`, the emit/audit exports.
- **Contribute:** access enforcement is the mechanism (decoupled from `Context`); apps keep their `POLICIES`/`OP_ACCESS`
  as *data*. New enforcement primitives or access modes go here — this is the only server-side enforcement home.

### `@suluk/builder`
- **What:** a tiered contract-narrowing DSL (components → blocks → sections → pages); `buildApp` emits backend
  (routes + v4) AND frontend from one composition.
- **When:** you want to compose a whole app declaratively from first-party building blocks.
- **Entry:** `buildApp`, the registries (`ECOMMERCE`/`AUTH`/`BILLING`/`CRM`/`MARKETING`/`LAYOUT`…), `ComposeResult`.
- **Contribute:** new reusable blocks/sections belong in the first-party registry; app-specific compositions don't.

### `@suluk/better-auth`
- **What:** official Better-Auth-on-Hono: auth methods → v4 `securitySchemes`; ingest Better Auth's 3.0 doc → v4;
  session → `principal` for per-viewer projection.
- **When:** the app uses Better Auth and you want auth reflected in the contract + a principal for access/cost.
- **Entry:** `mountAuth`, the ingest/cascade/preview-login helpers, `AuthMethods`/`MintedSession`.
- **Contribute:** new auth-method → securityScheme mappings; keep the session→principal shape stable (many packages
  depend on it).

## Family 3 — Renderers (contract OUT, read-only views)

### `@suluk/reference`
- **What:** render a v4 doc **natively** as server HTML (no client build, Workers-safe) — operation browser, cost
  explorer, access "View-as" lens, ADA playground, hardening report. Shows what a 3.x renderer cannot.
- **When:** you want a native-v4 docs page or embeddable insight panels, server-rendered.
- **Entry:** `referenceHtml`/`referenceResponse`, `referenceInsightsHtml` (the panels as a string — runs client-side
  too), and the pure panel fns (`costExplorer`, `hardeningPanel`, …).
- **Contribute:** panels are pure HTML-returning functions (great for embedding). New v4-only insights go here.

### `@suluk/scalar`
- **What:** render a v4 doc with Scalar API Reference — **natively** via the suluk fork (Scalar ingests v4, shows the
  `4.0.0-candidate` badge + facets) or via the 3.1 downgrade for vanilla Scalar.
- **When:** you want the Scalar UI. Use `scalarV4*` for native v4; `scalar*` for the 3.1 fallback.
- **Entry:** `scalarV4Html`/`scalarV4Response`, `scalarHtml`/`scalarResponse`, `enrichedV4`/`enrichFacetBadges`.
- **Contribute:** the fork itself is `tooling/ts/scalar-fork/` (clone-upstream + `patches/*.patch` → `standalone-suluk.js`).
  To teach Scalar new v4 shapes, add a patch there (it fails loudly if upstream moved). This package only *feeds* it.

### `@suluk/swagger`
- **What:** render via Swagger UI (through the 3.1 downgrade).
- **When:** a consumer specifically needs Swagger UI. Entry: `swaggerHtml`/`swaggerResponse`.
- **Contribute:** thin; most depth lives in `@suluk/openapi-compat` (the downgrade).

### `@suluk/editor`
- **What:** a fully-static, client-only v4 **editor** (the editor.scalar.com analog) — CodeMirror + the Scalar fork as
  a live preview + in-browser diagnostics, 3.1→v4 upgrade, share-permalink. Live at editor.suluk.saastemly.com.
- **When:** you want an authoring surface for v4 docs. Entry: `editorHtml`/`editorResponse`, `examples`.
- **Contribute:** it is a *thin shell* over `@suluk/{core,harden,openapi-compat,scalar,reference}` + the fork
  ([C033](doc/architecture/decisions/C033-suluk-editor-thin-shell.md)). New editor features compose those — don't fork
  upstream scalar-app. Rebuild the client bundle with `bun run build:client`.

### `@suluk/docs`
- **What:** generate a static documentation site for a Bun/TS monorepo from source (package.json + doc-comments +
  exports + README/ARCHITECTURE). Entry: `generateSite`, `harvest`/`harvestPackage`.
- **When:** documenting the monorepo itself (not the API — that's `reference`/`scalar`).

## Family 4 — Codegen projections (contract OUT → owned source; respect the L3 line)

These emit **code/specs you own** — never a hosted runtime ([C023](doc/architecture/decisions/C023-contract-lifecycle-facets-and-the-L3-line.md)).

### `@suluk/sdk`
- **What:** a complete, typed TypeScript SDK from the v4 doc (ofetch-based, entity-grouped, auth wired).
- **When:** consumers need a client library. Entry: `generateSdk(doc, opts)`, `tsType`.
- **Contribute:** keep the output idiomatic + fully typed from the schemas; new client ergonomics go here.

### `@suluk/nano-stores`
- **What:** typed Nano Stores client from v4 contracts — per-operation fetcher/mutator stores (@nanostores/query),
  Zod-validated I/O, plus ready cart/discount/drawer store helpers.
- **When:** a nanostores frontend. Entry: `CartStore`, `DiscountStore`, the bind helpers.

### `@suluk/panel`
- **What:** contract-first admin panels (Payload-style), projected from one v4 doc — infers field types, renders
  forms + tables. Entry: `EntityModel`, `FormOptions`/`ListOptions`, `PANEL_CSS`.
- **When:** you need an admin UI derived from the contract (vs `@suluk/admin`, which is the *cockpit* UI).

### `@suluk/shadcn`
- **What:** v4 Schema Objects → shadcn/ui form + table specs and TSX scaffolds (react-hook-form + zodResolver).
  Codegen, no runtime UI deps. Entry: `renderFormTsx`, `renderTableTsx`, `renderShadcnTheme`.
- **When:** a React/shadcn frontend that wants generated, owned components.

### `@suluk/testgen`
- **What:** a **deterministic conformance test suite** from the v4 contract — the executable form of its claims
  (asserts the server ENFORCES access/status/schema/cost). Entry: `generateTests`, `generateMoneyTests`.
- **When:** always, for any app that takes facets seriously — this is what makes `x-suluk-*` load-bearing, not
  decorative. Contribute: new facet → new asserted claim here.

### `@suluk/mcp`
- **What:** project ONE v4 doc into an MCP server (each operation → an MCP tool, read-only by default), Streamable HTTP.
  Entry: `mcpApp`/tools exports, `DISCOVER_TOOL`.
- **When:** exposing the API to LLM agents over MCP.

### `@suluk/visual`
- **What:** pixel-confidence by construction — verify each UI primitive's pixels once (golden snapshot), confidence
  propagates to every generated UI via content-hash. Entry: `primitiveCss`, `renderPrimitiveHtml`, `knownWidgets`.
- **When:** you need visual-regression confidence over generated UI without snapshotting every screen.

## Family 5 — Facets & lifecycle

### `@suluk/cost`
- **What:** cost as a contract facet — declare per-op cost (incl. third-party usage), bubble into doc/Scalar/tests,
  and **meter actual** per-user cost. Entry: `summarize`, `principalCost`, `CostSummary`.
- **When:** any metered/usage-priced API. Pairs with `@suluk/stripe` (meter events) + `@suluk/testgen` (cost claims).

### `@suluk/harden`
- **What:** schema hardening as a derived facet — audit input schemas (A–F grade + findings) AND the inverse transform
  that fixes them. Entry: `auditDocument`/`auditOperation`, `hardenDocument`/`hardenSchema`, `assertGrade`.
- **When:** gating CI on input-validation coverage, or auto-tightening loose schemas. The audit↔transform pair is the
  template for "ship both halves" (it once shipped only the audit — see C032).

### `@suluk/agents`
- **What:** project an `x-suluk-agents` map (skills + deterministic routes + by-name sub-agents) to a Claude plugin
  AND an OpenRouter manifest; lint it. Entry: the lint/diagram/catalog exports.
- **When:** packaging the app's agent surface for Claude/OpenRouter.

## Family 6 — App primitives (the breadth layer)

| Package | What | When / Entry |
|---|---|---|
| `@suluk/email` | the missing `EmailProvider` binding + `renderEmailHtml` with per-event/per-locale branded templates (verify/reset/order-confirmation/…), Workers-safe providers | sending transactional email; `pickProvider`, `renderEmailHtml`, `brandedEmail` |
| `@suluk/i18n` | typed locale/direction model, Workers-safe message loader + default-locale fallback, `Intl` formatting | any content app; `defineLocales`, `t`, `formatDate`/`formatCurrency`/`formatNumber` |
| `@suluk/theme` | the design-token CONTRACT (OKLCH + scales) projecting to CSS vars / Tailwind / shadcn tokens | theming; `themeFromLight`, `deriveDark`, `toThemeCss`, reference schemes |
| `@suluk/seo` | framework-agnostic SEO — robots, sitemaps (hreflang/images), schema.org JSON-LD, OG images, web manifest | any public site; the robots/sitemap/manifest/og builders |
| `@suluk/env` | config + secrets as one typed source, post-quantum-encrypted secret values, projected per-surface | config management; `defineEnv`-style spec + `assert`/health |
| `@suluk/stripe` | first-class Stripe via a swappable `PaymentProvider` — usage billing (Billing Meters), subscriptions, webhooks; SDK-free verifier | payments/billing; `restStripe`, `verifyStripeSignature`, `STRIPE_EVENTS`, `webhookRouter`, `retrievePaymentIntent` |
| `@suluk/chat` | a contract-driven in-page agent that browses AND acts via an OpenRouter tool-use loop over the same API ops | an in-app assistant; `chatApp`, `chatWidget` |

## Family 7 — Infra / deploy

### `@suluk/cloudflare`
- **What:** API-driven Cloudflare provisioning + deployment (no wrangler CLI) — typed REST client, idempotent
  provisioners (D1/KV/R2), asset upload (incl. `_headers`/`_redirects` as config rules), worker deploy, secrets, crons.
- **When:** deploying a Suluk app (or any static/worker site) to Cloudflare programmatically.
- **Entry:** `deploy`/`deployWith(opts, plan, log)`, `CloudflareClient`, `provisionD1`/`applyMigrations`,
  `uploadAssets`, `kvRateLimitStore`.
- **Contribute:** `deploy()` is deliberately **pure over injected bytes** — the disk-reading wrapper is the app's seam
  (don't push file IO into the package). Routes/custom-domains aren't in the plan yet → attach via `CloudflareClient.request`
  (see saasuluk's `scripts/deploy-editor.ts`); if that pattern recurs, *that's* a candidate to fold in.

### `@suluk/deploy`
- **What:** deploy behind a SWAPPABLE target interface (Cloudflare is the first adapter); also schema→SQL helpers.
- **When:** you want provider-agnostic deploy. Entry: `providers`, `cloudflare` adapter, `schemaToSql`/`migrationSql`.
- **Contribute:** new providers are new *adapters* behind the same interface — the whole point.

## Family 8 — Cockpit & meta

| Package | What | Note |
|---|---|---|
| `@suluk/cockpit` | the pure cockpit core (cycle · builder model · codegen · deploy planning · validate/audit/preview/converge) | shared brain of the vscode ext + `/superadmin` |
| `@suluk/admin` | the `/superadmin` web panel — the cockpit rendered as a Hono web UI, superadmin-gated | `adminApp` |
| `suluk-vscode` | the unifying cockpit as a VS Code extension (validate/audit/preview/generate) | not published as `@suluk/*` |
| `@suluk/models` | a weekly public-data OpenRouter model catalog + a NEEDS+PREFERENCE selector | `OPENROUTER_CATALOG`, `PROFILES`, selector |
| `@suluk/example-petshop` | end-to-end demo: Drizzle → builder → validated CRUD + Scalar + frontend, from one source | the canonical "how it all fits" reference |

---

## How to *use* a package (the mechanics)

1. Add the dep to the consumer's `package.json` (`"@suluk/x": "^a.b.c"`), `bun install --force` (registry propagation
   lags — `--force` defeats it).
2. Import from the package root (`import { thing } from "@suluk/x"`). Server-side consumption transpiles the TS source;
   pre-built client bundles ship in `dist/`.
3. Prefer the package's **common-case** entry + its overridable options. If you find yourself reaching past the public
   API, that's a signal the seam is missing → see `contributing.md`.
4. For anything on the money/auth path, wire `@suluk/testgen` conformance + a characterization test *before* relying on it.
