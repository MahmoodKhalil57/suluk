[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / paidToolPrice

# Function: paidToolPrice()

> **paidToolPrice**(`cost`): [`PaidToolPrice`](../interfaces/PaidToolPrice.md) \| `null`

Defined in: [agents/src/runtime-shared.ts:45](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/agents/src/runtime-shared.ts#L45)

Derive an x402 `paidTool` price from an operation's declared `x-suluk-cost` (a `CostModel`, read STRUCTURALLY — no
`@suluk/cost` dep). The price is the FLAT (per-call/per-request) portion: `estimateMicroUsd` if given, else the sum
of flat components' `microUsd`. Usage-metered components (per-token/second/mb/unit) are NEVER folded into the fixed
number — they only set `metered` (so the projection can point at MPP `session` instead). Returns `null` when no
chargeable cost is declared (a free tool stays a plain `tool()`). DECLARED, never enforced (C026 honesty).

## Parameters

### cost

`unknown`

## Returns

[`PaidToolPrice`](../interfaces/PaidToolPrice.md) \| `null`
