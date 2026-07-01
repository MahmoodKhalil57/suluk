[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cost](../README.md) / settlementAudit

# Function: settlementAudit()

> **settlementAudit**(`doc`): [`SettlementFinding`](../interfaces/SettlementFinding.md)[]

Defined in: [settlement.ts:35](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/cost/src/settlement.ts#L35)

Audit that every PRICED operation names HOW it is settled, and that the named lever is coherent — the generic form of
toolfactory's "cost names a lever" governance check.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

## Returns

[`SettlementFinding`](../interfaces/SettlementFinding.md)[]
