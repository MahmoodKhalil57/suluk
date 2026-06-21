<p align="center">
  <a href="https://github.com/MahmoodKhalil57/suluk">
    <img src="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/wordmark.png" alt="Suluk" width="360" />
  </a>
</p>

<h1 align="center">@suluk/cost</h1>

<p align="center"><b>Cost as a contract facet, plus a runtime meter for what every request actually cost — traced from the frontend action down to each third party.</b></p>

<p align="center">
  <em>Part of <a href="https://github.com/MahmoodKhalil57/suluk">Suluk</a> — one typed OpenAPI v4 contract projecting into every full-stack layer.</em>
</p>

---

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```sh
bun add @suluk/cost
```

`hono` is an **optional** peer dependency — needed only for the request-time middleware (`costMeter`,
`recordUsage`). The contract, event, and ledger helpers have no runtime deps beyond `@suluk/core`.

## What it does

You can't price a user without knowing what they cost you. `@suluk/cost` makes cost a first-class,
declared part of the contract — and then meters the real thing:

- **Declare cost on the contract.** Attach a `CostModel` to each operation as the `x-suluk-cost`
  vendor extension. Like every Suluk facet it bubbles: it survives the 3.1 downgrade (3.1 keeps
  `x-*`), Scalar/Swagger render it, and a coverage **audit** can flag operations that never declared
  a cost (unknown ≠ assumed zero).
- **Meter the actual cost per request.** A Hono middleware records what each request *did* cost —
  fixed (per-call) components plus metered third-party usage the handler reported — attributed all the
  way down: frontend action → operation → per-source breakdown.
- **Bill background events too.** A fired webhook / cron tick / queue message has no live caller, so a
  separate Context-free path resolves **who pays** (a runtime attribution expression), dedupes
  at-least-once delivery, and reconciles the declared estimate against the third party's *actual*
  charge read from the event payload.
- **Read the raw ledger.** Aggregate cost events by principal, operation, action, and source. All money
  is integer **micro-USD** (1 USD = 1,000,000 µ$) — the rawest representation. We display it as-is and
  let you build pricing on top.

## When to reach for it

- Any metered or usage-priced API — anything where a single user can cost you real money (LLM tokens,
  egress, downstream third-party calls) and you need the per-user picture to price them.
- When you want cost to be *auditable* in CI: `costAudit` is the coverage gate (every money-moving op
  must declare what it costs).
- Pairs with **`@suluk/stripe`** for the billing side — `@suluk/cost` produces the raw ledger; Stripe
  turns it into invoices/metered subscriptions. This package never imposes pricing, margins, or limits.

## Usage

### 1. Declare cost as a contract facet

```ts
import { annotateCosts, costAudit, costTable, type CostModel } from "@suluk/cost";
import { emitV4 } from "@suluk/hono";

const ask: CostModel = {
  components: [
    { source: "compute", basis: "per-call", microUsd: 50 },
    { source: "openai", basis: "per-1k-tokens", microUsd: 2000, description: "$0.002 / 1k tokens" },
  ],
  estimateMicroUsd: 1050, // typical total for display/tests before usage is known
};

const { document } = emitV4(/* operations… */);

// Set x-suluk-cost on each named operation (returns a new doc; covers paths + webhooks).
const annotated = annotateCosts(document, { ask });

// Coverage audit — which operations never declared a cost (warns), plus background-cost disciplines.
for (const f of costAudit(annotated)) console.warn(f.code, f.operation, f.message);

// The declared costs, raw, for an admin/cockpit table.
console.table(costTable(annotated)); // [{ operation, path, estimateMicroUsd, sources, trigger }]
```

### 2. Meter the actual cost at runtime (Hono)

```ts
import { costMeter, recordUsage, MemoryCostSink } from "@suluk/cost";
import { Hono } from "hono";

const sink = new MemoryCostSink(); // swap in D1 / a queue in production
const app = new Hono<{ Variables: { operation: string; principal: string } }>();

app.use("*", costMeter({
  sink,
  costs: { ask },                                 // operation name → declared CostModel
  operationOf: (c) => c.get("operation"),         // resolve the op name for this request
  principalOf: (c) => c.get("principal"),         // resolve the user id (optional)
  // actionHeader defaults to "x-suluk-action"; now defaults to () => Date.now()
}));

app.post("/ask", (c) => {
  recordUsage(c, "openai", 2000); // report MEASURED third-party usage for THIS request
  return c.json({ answer: "42" });
});
// → records a CostEvent: { operation: "ask", principal, action, breakdown, totalMicroUsd }
```

`computeCost(model, usage)` is the pure core the meter uses — call it directly to get the
`{ breakdown, totalMicroUsd }` for a model + measured usage, e.g. for previews or tests.

### 3. Bill a background event (webhook / cron / queue)

A fired event has no Hono `Context`, so it gets a Context-free path. The model declares **when** it
fires (`trigger`), **who pays** (`attribution`), and how it **reconciles** with the actual charge:

```ts
import { recordEventCost, type CostModel } from "@suluk/cost";

// Stripe fires payment_intent.succeeded → it charged you, attributed to the customer.
const chargeModel: CostModel = {
  components: [{ source: "stripe", basis: "per-call", microUsd: 2900 }],
  trigger: "webhook-received",
  attribution: { strategy: "event-expression", expression: "{$event.body#/customer}", trust: "verified" },
  idempotencyKey: "{$event.id}",       // dedupe at-least-once delivery
  reconciliationBasis: "payload-reconciled",
  amountExpression: "{$event.body#/amount}", // read the ACTUAL charge from the payload…
  amountUnit: "cents",                       // …in cents (Stripe) → ×10_000 into µ$
};

const event = { id: "evt_123", type: "payment_intent.succeeded", body: { customer: "cus_42", amount: 2900 } };
const seen = new Set<string>(); // an in-memory dedupe store for dev; a durable KV/DO in prod

// Resolves the principal, dedupes by idempotencyKey, and records — returns null on a redelivery.
const recorded = await recordEventCost(
  sink,
  { operation: "stripeCharge", model: chargeModel, event, at: Date.now() },
  seen,
);
```

> Security: an `event-expression` off an **unverified** payload is attacker-controllable. Gate it
> behind a verified webhook signature and set `trust: "verified"` — `costAudit` flags
> `unverified-attribution` otherwise. A cost that resolves no principal bills to the `UNATTRIBUTED`
> (`@unattributed`) sentinel — fail loud, never silent.

### 4. Read the raw ledger

```ts
import { summarize, principalCost, formatMicroUsd } from "@suluk/cost";

const events = sink.events();
const totals = summarize(events);
// { total, count, byPrincipal, byOperation, byAction, bySource } — all in µ$

console.log("what did user_42 cost me?", formatMicroUsd(principalCost(events, "user_42").total));
```

## API

| Export | What it does |
| --- | --- |
| `annotateCosts(doc, costs)` | Set `x-suluk-cost` on each named operation; returns a new doc. |
| `costOf(req)` / `triggerOf(model)` / `isDeferredCost(model)` | Read a request's model; its trigger (default `synchronous`); whether the cost is a background event. |
| `costAudit(doc)` | Coverage + discipline audit → `CostFinding[]` (no-cost-model, zero-cost, unattributed/unverified background cost, reconciliation-incomplete). |
| `costTable(doc)` | The declared costs (paths + webhooks + jobs) as `CostRow[]` for display. |
| `eachOperation(doc)` / `eachJob(doc)` | Walk every cost locus — path requests, webhooks, and C025 jobs. |
| `computeCost(model, usage)` | Pure: `{ breakdown, totalMicroUsd }` from a model + measured usage. |
| `costMeter(opts)` | Hono middleware that records a `CostEvent` per request. |
| `recordUsage(c, source, units)` | A handler reports measured third-party usage for the current request. |
| `MemoryCostSink` / `CostSink` | In-memory sink for dev/tests; the `record(event)` port you implement for prod. |
| `resolveEventExpression(expr, event)` | Resolve a `{$event.…}` runtime-expression (top-level key or JSON-Pointer) against a fired event. |
| `attributePrincipal(model, event, supplied?)` | Resolve who pays for a fired event; `@unattributed` when nothing resolves. |
| `reconciledAmount(model, event)` | The actual charge (µ$) read from the payload when `payload-reconciled`. |
| `eventCostEvent(input)` / `recordEventCost(sink, input, seen?)` | Build / record a background `CostEvent` (deduped by `idempotencyKey`). |
| `summarize(events)` / `principalCost(events, principal)` | Aggregate the ledger; one principal's slice. |
| `formatMicroUsd(µ$)` | Display µ$ as a `$` string (storage stays integer). |
| `COST_EXT` / `UNATTRIBUTED` | The `x-suluk-cost` extension key; the no-principal sentinel. |

The cost-model vocabulary: `CostBasis` (`per-call`, `per-unit`, `per-token`, `per-1k-tokens`,
`per-second`, `per-request`, `per-mb`), `CostTrigger` (`synchronous`, `webhook-received`, `scheduled`,
`queue-consumed`, `callback-completed`), `CostAttribution`, and `ReconciliationBasis` — three
orthogonal axes: `basis` = HOW it meters, `trigger` = WHEN it fires, `attribution` = WHO pays.

## Boundary

This package **measures and displays** cost — it does not price, charge, or persist. It stays
honestly raw on purpose:

- **Inject the sink.** `costMeter`/`recordEventCost` write `CostEvent`s to a `CostSink` *you* provide.
  `MemoryCostSink` is for dev/tests; production swaps in D1, a queue, or a Durable Object. The
  package never opens a database.
- **Inject the inputs.** Wall-clock (`now` / `at`), the principal resolver, the dedupe store (`seen`),
  and the operation matcher are all passed in — so events are reproducible and testable, and nothing
  reads ambient state.
- **Pricing lives downstream.** Margins, plans, limits, and invoices are the consumer's to build —
  typically via **`@suluk/stripe`**, which turns this ledger into metered billing. `@suluk/cost`
  stops at the raw µ$ picture.

## License

Apache-2.0
