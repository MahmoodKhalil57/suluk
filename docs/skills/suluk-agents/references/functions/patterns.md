# Functions

## patterns

### `agenticPatterns`
The agentic patterns an agent's composition SHAPE affords (advisory; the runtime picks the actual trajectory).
Returns `[]` for a flat agent (no sub-agents, no multi-round thinking) — a single-step tool-user affords none of
the multi-step patterns. Unknown agent name ⇒ `[]`.
```ts
agenticPatterns(doc: OpenAPIv4Document, name: string): PatternAffordance[]
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `name: string`
**Returns:** `PatternAffordance[]`

### `affordedPatterns`
Convenience: just the pattern names an agent's shape affords (advisory).
```ts
affordedPatterns(doc: OpenAPIv4Document, name: string): AgenticPattern[]
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `name: string`
**Returns:** `AgenticPattern[]`
