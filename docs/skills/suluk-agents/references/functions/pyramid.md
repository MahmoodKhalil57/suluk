# Functions

## pyramid

### `agentLevel`
An agent's pyramid LEVEL: its composition height above the deterministic route-floor. A leaf agent (skills/routes
only, no sub-agents) is **1** (it composes only the floor). An agent that composes sub-agents is **1 + max(child
level)**. Returns `FLOOR_LEVEL` (0) for any name that is NOT an orchestrating agent (a route/leaf capability — it
lives on the floor). Returns `Infinity` when a sub-agent cycle makes the height unbounded (a contract defect the
cycle-linter / grade already fail on). Cycle-safe via the shared `subtreeDepth` seen-guard. Never read by D1.
```ts
agentLevel(doc: OpenAPIv4Document, name: string): number
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `name: string`
**Returns:** `number`

### `layerReport`
Build the whole-document pyramid view. Folds, for every agent: its static LEVEL + composition counts, plus the
three observability signals the operator asked for — hardening (`gradeAgent`), token-budget and context-waste
(`contextReport`). Pure + static. `opts` is the SAME options bag `gradeAgent` takes (instructions / catalog /
modelWindows / served / snapshots); pass what you have and the richer columns fill in, omit it for the structure.
```ts
layerReport(doc: OpenAPIv4Document, opts: AgentGradeOptions): LayerReport
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `opts: AgentGradeOptions` — default: `{}`
**Returns:** `LayerReport`
