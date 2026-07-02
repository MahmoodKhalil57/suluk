[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / agentsView

# Function: agentsView()

> **agentsView**(`doc`, `opts?`): [`AgentsView`](../interfaces/AgentsView.md)

Defined in: [cockpit/src/agents.ts:114](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/cockpit/src/agents.ts#L114)

Build the OBSERVE view-model for the agent layer of a document. Never throws; tolerates non-installable agents.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### opts?

#### catalog?

[`ModelCatalog`](../../agents/interfaces/ModelCatalog.md)

## Returns

[`AgentsView`](../interfaces/AgentsView.md)
