[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / assertDefaultServedResident

# Function: assertDefaultServedResident()

> **assertDefaultServedResident**(`doc`, `agentName`, `defaultServedToolNames`): [`ConformanceFinding`](../interfaces/ConformanceFinding.md)[]

Defined in: [agents/src/conformance.ts:92](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/agents/src/conformance.ts#L92)

TIER-TRIM CONFORMANCE: the DEFAULT served tool set must contain NO cold-tail tool (those belong behind
`discover_tools`). A cold-tail tool in the default list is a silent no-op of the tier label — the reduction the
tiering thesis promises is not actually being delivered on the served path.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### agentName

`string`

### defaultServedToolNames

`string`[]

## Returns

[`ConformanceFinding`](../interfaces/ConformanceFinding.md)[]
