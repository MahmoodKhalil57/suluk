[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / assertServedSubsetGoverned

# Function: assertServedSubsetGoverned()

> **assertServedSubsetGoverned**(`doc`, `agentName`, `servedToolNames`): [`ConformanceFinding`](../interfaces/ConformanceFinding.md)[]

Defined in: [agents/src/conformance.ts:106](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/agents/src/conformance.ts#L106)

POLICY-AWARE OVER-SERVE (C028): when an operator policy governs the agent, the served tools must be a subset of
the POST-POLICY effective surface — a served tool the operator DENIED is a conformance failure (the operator cap
must hold on the wire). With no governing policy this is identical to [assertServedSubset](assertServedSubset.md).

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### agentName

`string`

### servedToolNames

`string`[]

## Returns

[`ConformanceFinding`](../interfaces/ConformanceFinding.md)[]
