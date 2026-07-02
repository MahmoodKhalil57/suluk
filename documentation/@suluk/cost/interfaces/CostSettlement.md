[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cost](../README.md) / CostSettlement

# Interface: CostSettlement

Defined in: [types.ts:98](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cost/src/types.ts#L98)

`@suluk/cost` — cost as a contract facet + runtime metering. You can't price a user without knowing what
they cost you. So: declare per-operation cost (incl. third-party usage) on the contract — it bubbles into
the v4 doc, Scalar, and the audit; meter the ACTUAL cost per request at runtime, traced from the frontend
action down to each third party; and read the raw per-user picture from the ledger. We display the data as
it is and let you build pricing on top (Stripe via @suluk/stripe). CANDIDATE tooling — NOT official OAS.

## Properties

### credits?

> `optional` **credits?**: `number`

Defined in: [types.ts:102](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cost/src/types.ts#L102)

method:"credit" — the credits debited per call (a non-negative integer). Omitted ⇒ derived from
 `estimateMicroUsd` × the operator's credit rate (a runtime concern, not declared here).

***

### method

> **method**: [`SettlementMethod`](../type-aliases/SettlementMethod.md)

Defined in: [types.ts:99](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cost/src/types.ts#L99)

***

### overflow?

> `optional` **overflow?**: `"credit"` \| `"deny"`

Defined in: [types.ts:105](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cost/src/types.ts#L105)

method:"rate-limited" — what happens when the free cap (`x-suluk-ratelimit`) is exhausted: refuse, or fall back
 to charging credits. Advisory; the runtime enforces it.
