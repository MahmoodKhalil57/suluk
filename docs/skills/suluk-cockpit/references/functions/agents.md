# Functions

## agents

### `agentsView`
Build the OBSERVE view-model for the agent layer of a document. Never throws; tolerates non-installable agents.
```ts
agentsView(doc: OpenAPIv4Document, opts: { catalog?: ModelCatalog }): AgentsView
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `opts: { catalog?: ModelCatalog }` — default: `{}`
**Returns:** `AgentsView`

### `agentsSummary`
A one-line ship-readiness summary for the agent layer (mirrors the cockpit's other *Summary helpers).
```ts
agentsSummary(view: AgentsView): string
```
**Parameters:**
- `view: AgentsView`
**Returns:** `string`
