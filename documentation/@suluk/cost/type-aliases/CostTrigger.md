[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cost](../README.md) / CostTrigger

# Type Alias: CostTrigger

> **CostTrigger** = `"synchronous"` \| `"webhook-received"` \| `"scheduled"` \| `"queue-consumed"` \| `"callback-completed"`

Defined in: [types.ts:35](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/cost/src/types.ts#L35)

WHEN/WHAT fires a cost (C024) — a STATIC, locally-decidable enum (the same KIND as [CostBasis](CostBasis.md)). Default
"synchronous" ⇒ every existing declaration is unchanged (zero migration). Strictly DESCRIPTIVE: it names where the
cost accrues, asserting NO event-channel / delivery-protocol semantics — the fence that keeps it orthogonal to
C018's deliberately-deferred async scope. Three axes stay orthogonal: `basis` = HOW it meters, `trigger` = WHEN it
fires, `attribution` = WHO pays.
