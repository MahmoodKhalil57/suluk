[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cost](../README.md) / SettlementMethod

# Type Alias: SettlementMethod

> **SettlementMethod** = `"credit"` \| `"rate-limited"` \| `"free"`

Defined in: [types.ts:96](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/cost/src/types.ts#L96)

HOW a declared cost is RECOVERED from the user (C044). `rate-limited` ⇒ free to the user — the cost is "paid" by
CAPPING usage, so the op's `x-suluk-ratelimit` IS the settlement (no money moves). `credit` ⇒ the user pays credits
(a balance is debited). `free` ⇒ truly free (the operator absorbs any cost). A purely STATIC fact (an enum + an
integer + names) — never a request value, so it rides the x-suluk-cost wall (matcher-invisible since C024).
