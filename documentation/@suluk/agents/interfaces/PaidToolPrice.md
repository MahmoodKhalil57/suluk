[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / PaidToolPrice

# Interface: PaidToolPrice

Defined in: [agents/src/runtime-shared.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/agents/src/runtime-shared.ts#L29)

An x402 `paidTool` price derived from a route's declared `x-suluk-cost` (C026/C035).

## Properties

### metered

> **metered**: `boolean`

Defined in: [agents/src/runtime-shared.ts:35](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/agents/src/runtime-shared.ts#L35)

true ⇒ ALSO has usage-metered components a fixed per-call price can't capture — the honest pointer to MPP `session`.

***

### microUsd

> **microUsd**: `number`

Defined in: [agents/src/runtime-shared.ts:33](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/agents/src/runtime-shared.ts#L33)

the same, raw micro-USD (the cost model's native unit; 1 USD = 1_000_000 µ$).

***

### priceUsd

> **priceUsd**: `number`

Defined in: [agents/src/runtime-shared.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/agents/src/runtime-shared.ts#L31)

the flat per-call price in USD — the `paidTool(name, desc, PRICE, …)` argument.
