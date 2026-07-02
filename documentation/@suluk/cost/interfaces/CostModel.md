[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cost](../README.md) / CostModel

# Interface: CostModel

Defined in: [types.ts:58](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/cost/src/types.ts#L58)

`@suluk/cost` — cost as a contract facet + runtime metering. You can't price a user without knowing what
they cost you. So: declare per-operation cost (incl. third-party usage) on the contract — it bubbles into
the v4 doc, Scalar, and the audit; meter the ACTUAL cost per request at runtime, traced from the frontend
action down to each third party; and read the raw per-user picture from the ledger. We display the data as
it is and let you build pricing on top (Stripe via @suluk/stripe). CANDIDATE tooling — NOT official OAS.

## Properties

### amountExpression?

> `optional` **amountExpression?**: `string`

Defined in: [types.ts:79](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/cost/src/types.ts#L79)

for "payload-reconciled": a runtime-expression yielding the ACTUAL amount (e.g. "{$event.body#/amount}").
 Runtime-only — never the static matcher. Interpreted in `amountUnit`.

***

### amountUnit?

> `optional` **amountUnit?**: `"micro-usd"` \| `"cents"` \| `"usd"`

Defined in: [types.ts:81](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/cost/src/types.ts#L81)

the unit `amountExpression` yields (default "micro-usd"). "cents" (Stripe) → ×10_000; "usd" → ×1_000_000.

***

### attribution?

> `optional` **attribution?**: [`CostAttribution`](CostAttribution.md)

Defined in: [types.ts:67](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/cost/src/types.ts#L67)

WHO is charged when there is no live session (runtime strategy; the expression never enters the static matcher).

***

### components

> **components**: [`CostComponent`](CostComponent.md)[]

Defined in: [types.ts:59](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/cost/src/types.ts#L59)

***

### estimateMicroUsd?

> `optional` **estimateMicroUsd?**: `number`

Defined in: [types.ts:61](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/cost/src/types.ts#L61)

Optional typical total for one call (µ$), for display + tests when usage isn't yet known.

***

### idempotencyKey?

> `optional` **idempotencyKey?**: `string`

Defined in: [types.ts:70](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/cost/src/types.ts#L70)

a runtime-expression yielding a stable id to DEDUPE at-least-once delivery (e.g. "{$event.id}") — prevents
 double-counting a cost charged on both the receipt op and the triggered op. Runtime-only.

***

### reconciliationBasis?

> `optional` **reconciliationBasis?**: [`ReconciliationBasis`](../type-aliases/ReconciliationBasis.md)

Defined in: [types.ts:76](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/cost/src/types.ts#L76)

How the amount RECONCILES with the third party's actual charge (C026; default "declared-estimate"). A declared
estimate is a guess; "payload-reconciled" reads the ACTUAL charged amount from the event at runtime (the real
invoice line — proration/tax/refund included), so the recorded cost is authoritative, not an approximation.

***

### settlement?

> `optional` **settlement?**: [`CostSettlement`](CostSettlement.md)

Defined in: [types.ts:84](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/cost/src/types.ts#L84)

HOW the operator RECOVERS this cost (C044). The fifth orthogonal axis — basis=how-meters · trigger=when-fires ·
 attribution=who-pays · reconciliation=declared-vs-actual · **settlement=how-recovered**.

***

### trigger?

> `optional` **trigger?**: [`CostTrigger`](../type-aliases/CostTrigger.md)

Defined in: [types.ts:63](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/cost/src/types.ts#L63)

WHEN/WHAT fires this cost (C024; default "synchronous"). STATIC — decouples accrual-time from the declaring op.

***

### triggerRef?

> `optional` **triggerRef?**: `string`

Defined in: [types.ts:65](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/cost/src/types.ts#L65)

the by-name handle (C009) of the webhook/callback/op whose firing accrues this cost (for a non-sync trigger).
