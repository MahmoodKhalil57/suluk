[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / agentDiagram

# Function: agentDiagram()

> **agentDiagram**(`doc`, `agentName`): [`DiagramNode`](../interfaces/DiagramNode.md)

Defined in: [agents/src/diagram.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/agents/src/diagram.ts#L31)

Build the agent's composition hierarchy. Cycle-safe: a back-edge on the current path becomes a marked leaf.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### agentName

`string`

## Returns

[`DiagramNode`](../interfaces/DiagramNode.md)
