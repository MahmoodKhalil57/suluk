[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / agentsView

# Function: agentsView()

> **agentsView**(`doc`, `opts?`): [`AgentsView`](../interfaces/AgentsView.md)

Defined in: [cockpit/src/agents.ts:114](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/cockpit/src/agents.ts#L114)

Build the OBSERVE view-model for the agent layer of a document. Never throws; tolerates non-installable agents.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### opts?

#### catalog?

[`ModelCatalog`](../../agents/interfaces/ModelCatalog.md)

## Returns

[`AgentsView`](../interfaces/AgentsView.md)
