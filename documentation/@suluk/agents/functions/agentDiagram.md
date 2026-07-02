[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / agentDiagram

# Function: agentDiagram()

> **agentDiagram**(`doc`, `agentName`): [`DiagramNode`](../interfaces/DiagramNode.md)

Defined in: [agents/src/diagram.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/agents/src/diagram.ts#L31)

Build the agent's composition hierarchy. Cycle-safe: a back-edge on the current path becomes a marked leaf.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### agentName

`string`

## Returns

[`DiagramNode`](../interfaces/DiagramNode.md)
