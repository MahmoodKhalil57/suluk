[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cost](../README.md) / costAudit

# Function: costAudit()

> **costAudit**(`doc`): [`CostFinding`](../interfaces/CostFinding.md)[]

Defined in: [contract.ts:78](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/cost/src/contract.ts#L78)

Cost-coverage audit: which operations have NOT declared what they cost — plus (C024) the background-cost
disciplines: a deferred cost that resolves no principal would bill to `@unattributed` (fail LOUD, never silent),
and an attribution read off an UNVERIFIED event payload is attacker-controllable. Walks paths AND webhooks.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

## Returns

[`CostFinding`](../interfaces/CostFinding.md)[]
