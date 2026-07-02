# Types & Enums

## types

### `CostBasis`
The cost model — what an operation declares it costs you, and what a single request actually cost.

All money is integer **micro-USD** (1 USD = 1_000_000 µ$). Integers avoid float drift and are the rawest
possible representation — we display the data AS IT IS and let consumers build pricing on top. A cost has
COMPONENTS, each tied to a source (a third party, compute, egress, …) and a basis (per-call vs per-unit),
so the actual cost of a request is the fixed components plus the metered usage of the variable ones.
```ts
"per-call" | "per-unit" | "per-token" | "per-1k-tokens" | "per-second" | "per-request" | "per-mb"
```

### `CostComponent`
`@suluk/cost` — cost as a contract facet + runtime metering. You can't price a user without knowing what
they cost you. So: declare per-operation cost (incl. third-party usage) on the contract — it bubbles into
the v4 doc, Scalar, and the audit; meter the ACTUAL cost per request at runtime, traced from the frontend
action down to each third party; and read the raw per-user picture from the ledger. We display the data as
it is and let you build pricing on top (Stripe via @suluk/stripe). CANDIDATE tooling — NOT official OAS.
**Properties:**
- `source: string` — Where the money goes: "openai", "compute", "egress", "twilio", … (free-form, your taxonomy).
- `basis: CostBasis`
- `microUsd: number` — Cost per one unit of `basis`, in micro-USD.
- `description: string` (optional)

### `CostModel`
`@suluk/cost` — cost as a contract facet + runtime metering. You can't price a user without knowing what
they cost you. So: declare per-operation cost (incl. third-party usage) on the contract — it bubbles into
the v4 doc, Scalar, and the audit; meter the ACTUAL cost per request at runtime, traced from the frontend
action down to each third party; and read the raw per-user picture from the ledger. We display the data as
it is and let you build pricing on top (Stripe via @suluk/stripe). CANDIDATE tooling — NOT official OAS.
**Properties:**
- `components: CostComponent[]`
- `estimateMicroUsd: number` (optional) — Optional typical total for one call (µ$), for display + tests when usage isn't yet known.
- `trigger: CostTrigger` (optional) — WHEN/WHAT fires this cost (C024; default "synchronous"). STATIC — decouples accrual-time from the declaring op.
- `triggerRef: string` (optional) — the by-name handle (C009) of the webhook/callback/op whose firing accrues this cost (for a non-sync trigger).
- `attribution: CostAttribution` (optional) — WHO is charged when there is no live session (runtime strategy; the expression never enters the static matcher).
- `idempotencyKey: string` (optional) — a runtime-expression yielding a stable id to DEDUPE at-least-once delivery (e.g. "{$event.id}") — prevents
 double-counting a cost charged on both the receipt op and the triggered op. Runtime-only.
- `reconciliationBasis: ReconciliationBasis` (optional) — How the amount RECONCILES with the third party's actual charge (C026; default "declared-estimate"). A declared
estimate is a guess; "payload-reconciled" reads the ACTUAL charged amount from the event at runtime (the real
invoice line — proration/tax/refund included), so the recorded cost is authoritative, not an approximation.
- `amountExpression: string` (optional) — for "payload-reconciled": a runtime-expression yielding the ACTUAL amount (e.g. "{$event.body#/amount}").
 Runtime-only — never the static matcher. Interpreted in `amountUnit`.
- `amountUnit: "micro-usd" | "cents" | "usd"` (optional) — the unit `amountExpression` yields (default "micro-usd"). "cents" (Stripe) → ×10_000; "usd" → ×1_000_000.
- `settlement: CostSettlement` (optional) — HOW the operator RECOVERS this cost (C044). The fifth orthogonal axis — basis=how-meters · trigger=when-fires ·
 attribution=who-pays · reconciliation=declared-vs-actual · **settlement=how-recovered**.

### `UsageReport`
A measured usage report for one variable component during a request (e.g. {source:"openai", units: 1350}).
**Properties:**
- `source: string`
- `units: number`

### `CostEvent`
What a single request actually cost — the rawest record, attributed all the way down.
**Properties:**
- `at: number` — Wall-clock ms (an input, never read ambiently — pass it in, so events are reproducible/testable).
- `principal: string` (optional) — Who incurred it (the principal/user id), if known.
- `operation: string` — Which operation (the v4 by-name handle).
- `action: string` (optional) — The frontend action that triggered it (a button-click id), if the client tagged the request.
- `trigger: CostTrigger` (optional) — How this cost fired (C024; default "synchronous"). A non-sync value marks a background charge.
- `dedupeKey: string` (optional) — Dedupe id for at-least-once event delivery — two events with the same key are the SAME charge (C024).
- `reconciled: boolean` (optional) — true ⇒ totalMicroUsd is the third party's ACTUAL charge read from the event (C026), not a declared estimate.
- `breakdown: { source: string; microUsd: number }[]` — Per-source breakdown (µ$).
- `totalMicroUsd: number` — Total µ$ for the request.

### `CostTrigger`
WHEN/WHAT fires a cost (C024) — a STATIC, locally-decidable enum (the same KIND as CostBasis). Default
"synchronous" ⇒ every existing declaration is unchanged (zero migration). Strictly DESCRIPTIVE: it names where the
cost accrues, asserting NO event-channel / delivery-protocol semantics — the fence that keeps it orthogonal to
C018's deliberately-deferred async scope. Three axes stay orthogonal: `basis` = HOW it meters, `trigger` = WHEN it
fires, `attribution` = WHO pays.
```ts
"synchronous" | "webhook-received" | "scheduled" | "queue-consumed" | "callback-completed"
```

### `CostAttribution`
WHO is charged when a third party fires the event with no live session (C024) — a declared STRATEGY the runtime
resolves a concrete principal from, modeled on `SulukRateLimit.key`. The `expression` is RUNTIME-ONLY: a C018
runtime-expression that NEVER enters the static matcher (D1-consistent, exactly as C018 walls its callback keys).
**Properties:**
- `strategy: "session" | "event-expression" | "job-stamped"` — session = the live caller (the existing path); event-expression = read the principal from the event payload at
 runtime; job-stamped = the job carries its own principal.
- `expression: string` (optional) — for event-expression: a C018 runtime-expression (e.g. "{$event.body#/customer}"). Runtime-resolved only.
- `trust: "verified" | "unverified-payload"` (optional) — is the attribution input authentic? An event-expression off an UNVERIFIED webhook payload is attacker-controlled
 — honor it as authoritative only when "verified" (a signature/secret check the runtime performs).

### `ReconciliationBasis`
Whether a cost's amount is a declared guess or read from the event payload at runtime (C026).
```ts
"declared-estimate" | "payload-reconciled"
```

### `SettlementMethod`
HOW a declared cost is RECOVERED from the user (C044). `rate-limited` ⇒ free to the user — the cost is "paid" by
CAPPING usage, so the op's `x-suluk-ratelimit` IS the settlement (no money moves). `credit` ⇒ the user pays credits
(a balance is debited). `free` ⇒ truly free (the operator absorbs any cost). A purely STATIC fact (an enum + an
integer + names) — never a request value, so it rides the x-suluk-cost wall (matcher-invisible since C024).
```ts
"credit" | "rate-limited" | "free"
```

### `CostSettlement`
`@suluk/cost` — cost as a contract facet + runtime metering. You can't price a user without knowing what
they cost you. So: declare per-operation cost (incl. third-party usage) on the contract — it bubbles into
the v4 doc, Scalar, and the audit; meter the ACTUAL cost per request at runtime, traced from the frontend
action down to each third party; and read the raw per-user picture from the ledger. We display the data as
it is and let you build pricing on top (Stripe via @suluk/stripe). CANDIDATE tooling — NOT official OAS.
**Properties:**
- `method: SettlementMethod`
- `credits: number` (optional) — method:"credit" — the credits debited per call (a non-negative integer). Omitted ⇒ derived from
 `estimateMicroUsd` × the operator's credit rate (a runtime concern, not declared here).
- `overflow: "credit" | "deny"` (optional) — method:"rate-limited" — what happens when the free cap (`x-suluk-ratelimit`) is exhausted: refuse, or fall back
 to charging credits. Advisory; the runtime enforces it.

## settlement

### `SettlementFinding`
**Properties:**
- `rule: string`
- `severity: SettlementSeverity`
- `operation: string`
- `path: string`
- `message: string`
- `fix: string`

### `SettlementSeverity`
```ts
"high" | "medium" | "low"
```

### `SettlementRollup`
**Properties:**
- `credit: number`
- `rate-limited: number`
- `free: number`
- `unsettled: number` — priced ops with NO settlement declared (the gap).

## contract

### `CostFinding`
**Properties:**
- `code: "no-cost-model" | "zero-cost" | "unattributed-background-cost" | "unverified-attribution" | "reconciliation-incomplete"`
- `severity: "warn" | "info"`
- `path: string`
- `operation: string`
- `message: string`

### `CostRow`
**Properties:**
- `operation: string`
- `path: string`
- `estimateMicroUsd: number`
- `sources: string[]`
- `trigger: CostTrigger`

## meter

### `CostSink`

## event

### `EventCostInput`
**Properties:**
- `operation: string` — the operation name whose cost fired (the webhook/op by-name handle).
- `model: CostModel` — its declared cost model (carrying trigger / attribution / idempotencyKey).
- `event: Record<string, unknown>` — the fired event payload.
- `at: number` — wall-clock ms (passed in — reproducible).
- `usage: UsageReport[]` (optional) — any metered third-party usage the handler measured.
- `suppliedPrincipal: string` (optional) — for `session`/`job-stamped` attribution: the principal the job/session carries.

## ledger

### `CostSummary`
**Properties:**
- `total: number`
- `count: number`
- `byPrincipal: Record<string, number>`
- `byOperation: Record<string, number>`
- `byAction: Record<string, number>`
- `bySource: Record<string, number>`
