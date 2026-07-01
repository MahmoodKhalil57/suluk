# C50. A registry-distributed SaaS-backend framework — shadcn registry + `@suluk/*` npm + `@suluk/provision` (OSB)

> **Provenance:** Candidate-fork ADR (Suluk), not a SIG decision. Operator-surfaced: *"most of toolfactory is very
> generic; a ton of platforms can use the same base. I want a framework library we set up once, provision real backend
> services to via the OSB API, and download into the repo with the shadcn GitHub registry
> (https://ui.shadcn.com/docs/registry/github). Literally everything in toolfactory is standard and should install
> modularly with a single shadcn command — except the `api/transcribe` and `api/subtitle/convert` routes."* Operator
> chose **hybrid composition** + **architecture-only** (record it; build later). Reframes/extends [C049](C049-toolfactory-adoption-roadmap.md).

Date: 2026-07-01

## Status

Accepted as an **ARCHITECTURE / roadmap** (plan only — no code this pass). Ceiling **0.5** (designed; the item boundaries +
`shadcn add` backend ergonomics are re-confirmed with a PoC at build time). Ledger:
[`0registry-framework.bn`](../../../plan/facts/0registry-framework.bn) (burhan True). **Not a contract-facet change.**

## Context

A survey of toolfactory (`api/src`) shows **~30 of its ~33 modules are generic** SaaS-backend plumbing — auth, hierarchical
API keys, a credit ledger, Stripe billing, cost projection, logging, rate-limiting, GDPR erasure, reactive stores, the
contract-audit/journeys harness. Only **`whisper.ts` + `lib/subtitle/` + the transcribe/convert routes** are the product.
The `@suluk/*` packages (this repo, now on npm) already hold the reusable *logic*; what's missing is a **distribution +
assembly layer** so a new platform composes a backend from those pieces instead of copy-pasting toolfactory.

The **shadcn GitHub registry** is the right distribution mechanism: `shadcn add <user>/<repo>/<item>` reads `registry.json`
straight from a repo (no server), items carry **any** files with `target` paths (backend routes/schema/scripts, not just
components), plus npm `dependencies`/`devDependencies`, `registryDependencies` (cross-item chaining), and `envVars`.
`#ref` pins a version. This is shadcn's "you own the code" model — exactly right for the app-level *wiring*.

## Decision — three composable layers

```
 @suluk/*  (npm)          the LOGIC       — credits atomic ledger, keys pooled-cap algebra, payments, cost, harden, journeys
    +
 shadcn registry          the OWNED WIRING — per-module routes + schema fragment + Hono glue, copied in & customised
    +
 @suluk/provision (OSB)   the INFRA       — D1/KV/R2/secrets/Stripe-connector, provisioned + migrated from a config
```

**Composition = HYBRID (operator decision).** A registry item owns the *wiring* (the routes/schema/glue you customise) and
**deps the `@suluk/*` package for the money/security-critical logic** — so a correctness/security fix (the atomic-debit
CAS, the pooled-headroom cap, the idempotent grant, a Stripe status-mapping fix) flows to **every** consumer via npm,
while the app keeps ownership of the surface it actually edits. (Not "fully owned" — money logic must not fork per repo.)

**A registry item** (example — the `credits` module):
```json
{
  "name": "credits",
  "type": "registry:item",
  "title": "Credit ledger + metered debit",
  "registryDependencies": ["suluk/registry/auth"],
  "dependencies": ["@suluk/credits", "@suluk/drizzle", "drizzle-orm"],
  "files": [
    { "path": "routes/credits.ts",     "target": "src/routes/credits.ts" },
    { "path": "db/credits.schema.ts",  "target": "src/db/credits.schema.ts" },
    { "path": "provision/credits.ts",  "target": "provision/credits.ts" }
  ],
  "envVars": {}
}
```
The `provision/credits.ts` file is the module's **provision fragment** — the `InstanceSpec[]` (its D1 tables/migrations,
any KV/connector) that gets merged into the app's `provision.config.ts`; `@suluk/provision generate/migrate` then creates
the real services (OSB). This is how "download the module" and "provision its backend" compose.

### The module map (~10 items over ~30 files)

| item | toolfactory files | schema | npm logic (hybrid) |
|---|---|---|---|
| `app` | index · middleware · errors · http · validation · origins | — | hono · @suluk/core |
| `auth` | auth · apikey-auth · mcp-auth · scopes | user/session/account/verification/passkey | @suluk/better-auth |
| `keys` | apikeys · key-lineage | apikey · key_lineage | @suluk/keys |
| `credits` | credits · bulk · rate-credit | credit_transaction/amount/key | @suluk/credits |
| `billing` | billing · pricing · auto-topup | billing_account · payment_alert · auto_topup | @suluk/billing · @suluk/payments |
| `cost` · `logs` · `stores` · `erasure` | cost / logs+logquery / stores / erasure | — | @suluk/cost |
| `audit` | conformance · contract-audit · errors/stores-audit · governance | — | @suluk/cockpit · @suluk/harden |
| `journeys` | journeys-* + `journeys/*.feature` | — | @suluk/journeys |

Product-specific (NEVER in the registry): `whisper.ts`, `lib/subtitle/`, the transcribe + subtitle/convert routes.

### The "setup once → per platform" flow
```
shadcn add suluk/registry/app        # Hono skeleton
shadcn add suluk/registry/{auth,keys,credits,billing,cost,logs,journeys,audit}   # regDeps chain the order
provision apply                      # OSB: create D1 + migrate + KV + Stripe connector from the merged config
# write ONLY the product routes
```

## Consequences / honesty

- **This reframes C049.** Toolfactory's "adoption" becomes *extraction*: turning its generic modules into registry items
  IS the generalization; toolfactory then becomes **one consumer** of the registry. C049's phases (A audit/BDD → B
  provision → C money) become the **extraction order**, money modules last + parity-tested.
- **Two feasibility caveats (PoC must close them):** (1) the plain `user/repo/item` GitHub form is **public-only** — a
  private Suluk registry needs shadcn's **namespace + authentication**; (2) DB schema/migrations aren't a native registry
  concept — each item ships a schema *fragment file* + a **provision fragment**, and `@suluk/provision` owns the actual
  table creation; a backend target also needs a minimal `components.json` (or absolute `target` paths). Validate with a
  single-module PoC (`credits`) before extracting the rest.
- **Money modules stay hybrid.** `credits`/`keys`/`billing`/`payments` items are thin wiring over the npm packages — never
  fully-owned copies (a forked ledger is a money-correctness hazard). The glue modules (errors/middleware/validation) can
  be fully-owned.
- **Naming + the registry's home repo are open** (a public repo for the plain form, or this repo + a namespace for
  private). Decide at build time.
- **Scope:** backend first (the survey + the OSB story are backend). A web/UI registry (toolfactory's `web/`) is a
  natural Phase 2, and is the shadcn sweet spot.
