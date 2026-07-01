[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cost](../README.md) / SettlementMethod

# Type Alias: SettlementMethod

> **SettlementMethod** = `"credit"` \| `"rate-limited"` \| `"free"`

Defined in: [types.ts:96](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/cost/src/types.ts#L96)

HOW a declared cost is RECOVERED from the user (C044). `rate-limited` ⇒ free to the user — the cost is "paid" by
CAPPING usage, so the op's `x-suluk-ratelimit` IS the settlement (no money moves). `credit` ⇒ the user pays credits
(a balance is debited). `free` ⇒ truly free (the operator absorbs any cost). A purely STATIC fact (an enum + an
integer + names) — never a request value, so it rides the x-suluk-cost wall (matcher-invisible since C024).
