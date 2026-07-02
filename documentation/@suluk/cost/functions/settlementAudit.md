[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cost](../README.md) / settlementAudit

# Function: settlementAudit()

> **settlementAudit**(`doc`): [`SettlementFinding`](../interfaces/SettlementFinding.md)[]

Defined in: [settlement.ts:35](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/cost/src/settlement.ts#L35)

Audit that every PRICED operation names HOW it is settled, and that the named lever is coherent — the generic form of
toolfactory's "cost names a lever" governance check.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

## Returns

[`SettlementFinding`](../interfaces/SettlementFinding.md)[]
