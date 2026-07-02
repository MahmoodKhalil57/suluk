[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / PaidToolPrice

# Interface: PaidToolPrice

Defined in: [agents/src/runtime-shared.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/agents/src/runtime-shared.ts#L29)

An x402 `paidTool` price derived from a route's declared `x-suluk-cost` (C026/C035).

## Properties

### metered

> **metered**: `boolean`

Defined in: [agents/src/runtime-shared.ts:35](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/agents/src/runtime-shared.ts#L35)

true ⇒ ALSO has usage-metered components a fixed per-call price can't capture — the honest pointer to MPP `session`.

***

### microUsd

> **microUsd**: `number`

Defined in: [agents/src/runtime-shared.ts:33](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/agents/src/runtime-shared.ts#L33)

the same, raw micro-USD (the cost model's native unit; 1 USD = 1_000_000 µ$).

***

### priceUsd

> **priceUsd**: `number`

Defined in: [agents/src/runtime-shared.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/agents/src/runtime-shared.ts#L31)

the flat per-call price in USD — the `paidTool(name, desc, PRICE, …)` argument.
