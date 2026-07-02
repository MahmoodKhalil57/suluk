# Functions

## context

### `contextReport`
Compute the context-intelligence report (load + right-sizing + model fit) for every agent in the document.
```ts
contextReport(doc: OpenAPIv4Document, opts: ContextOptions): ContextReport
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `opts: ContextOptions` — default: `{}`
**Returns:** `ContextReport`

### `suggestUnflatten`
When an agent is over its target, the cheapest decomposition: which resident tools to push to cold-tail.
```ts
suggestUnflatten(load: AgentContextLoad, target: number | undefined): UnflattenSuggestion | null
```
**Parameters:**
- `load: AgentContextLoad`
- `target: number | undefined` — default: `load.target`
**Returns:** `UnflattenSuggestion | null`
