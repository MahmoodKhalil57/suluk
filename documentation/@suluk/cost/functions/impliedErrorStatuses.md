[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cost](../README.md) / impliedErrorStatuses

# Function: impliedErrorStatuses()

> **impliedErrorStatuses**(`req`): `number`[]

Defined in: [settlement.ts:63](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/cost/src/settlement.ts#L63)

The HTTP error statuses a request's FACETS imply (the generic form of toolfactory's errors-gate): a contract should
declare these responses. credit→402 · authenticated/admin→401 · owner-scope→403 · rate-limit→429 · an upstream
third-party call (a `per-request` cost component)→502. A pure function of the declared facets.

## Parameters

### req

[`Request`](../../core/interfaces/Request.md)

## Returns

`number`[]
