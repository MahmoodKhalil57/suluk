[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / agentDiagram

# Function: agentDiagram()

> **agentDiagram**(`doc`, `agentName`): [`DiagramNode`](../interfaces/DiagramNode.md)

Defined in: [agents/src/diagram.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/agents/src/diagram.ts#L31)

Build the agent's composition hierarchy. Cycle-safe: a back-edge on the current path becomes a marked leaf.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### agentName

`string`

## Returns

[`DiagramNode`](../interfaces/DiagramNode.md)
