# Functions

## diagram

### `agentDiagram`
Build the agent's composition hierarchy. Cycle-safe: a back-edge on the current path becomes a marked leaf.
```ts
agentDiagram(doc: OpenAPIv4Document, agentName: string): DiagramNode
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `agentName: string`
**Returns:** `DiagramNode`

### `agentDiagramHtml`
Render the agent as ONE self-contained, interactive HTML page (collapsible + zoomable D3 tree).
```ts
agentDiagramHtml(doc: OpenAPIv4Document, agentName: string, opts: AgentDiagramOptions): string
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `agentName: string`
- `opts: AgentDiagramOptions` — default: `{}`
**Returns:** `string`
