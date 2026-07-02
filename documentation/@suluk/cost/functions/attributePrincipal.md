[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cost](../README.md) / attributePrincipal

# Function: attributePrincipal()

> **attributePrincipal**(`model`, `event`, `suppliedPrincipal?`): `string`

Defined in: [event.ts:40](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/cost/src/event.ts#L40)

Resolve the principal charged for a fired event per the model's attribution strategy. Returns the `@unattributed`
sentinel (never silent) when nothing resolves: `session`/`job-stamped` use the supplied principal; `event-expression`
reads it from the payload. NOTE: an `event-expression` with `trust !== "verified"` is attacker-controllable — the
caller MUST gate it behind a verified webhook signature before trusting the result for billing.

## Parameters

### model

[`CostModel`](../interfaces/CostModel.md)

### event

`Record`\<`string`, `unknown`\>

### suppliedPrincipal?

`string`

## Returns

`string`
