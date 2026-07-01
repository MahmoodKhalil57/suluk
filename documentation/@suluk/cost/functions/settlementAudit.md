[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cost](../README.md) / settlementAudit

# Function: settlementAudit()

> **settlementAudit**(`doc`): [`SettlementFinding`](../interfaces/SettlementFinding.md)[]

Defined in: [settlement.ts:35](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/cost/src/settlement.ts#L35)

Audit that every PRICED operation names HOW it is settled, and that the named lever is coherent — the generic form of
toolfactory's "cost names a lever" governance check.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

## Returns

[`SettlementFinding`](../interfaces/SettlementFinding.md)[]
