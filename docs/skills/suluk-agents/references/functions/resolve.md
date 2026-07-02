# Functions

## resolve

### `parsePointer`
Parse a `#/a/b~1c/d` fragment pointer into its decoded tokens (or null if not a local fragment pointer).
```ts
parsePointer(ref: string): string[] | null
```
**Parameters:**
- `ref: string`
**Returns:** `string[] | null`

### `resolveOperationRef`
Resolve a route's `operationRef` to an EXISTING operation. Supports the three operation loci:
 - `#/paths/<pathTemplate>/requests/<name>`  (a pathItem request — the common case)
 - `#/webhooks/<name>`                        (an incoming webhook operation)
 - `#/x-suluk-jobs/<name>`                    (a non-HTTP job, C025)
Returns null when the ref dangles (the resolve-lint failure — Conin's MCP-only `run_core_primitive`).
```ts
resolveOperationRef(doc: OpenAPIv4Document, ref: string): ResolvedOperation | null
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `ref: string`
**Returns:** `ResolvedOperation | null`

### `agentMap`
The agent map, or an empty record.
```ts
agentMap(doc: OpenAPIv4Document): Record<string, SulukAgent>
```
**Parameters:**
- `doc: OpenAPIv4Document`
**Returns:** `Record<string, SulukAgent>`

### `subAgentKey`
Decode a sub-agent ref `#/x-suluk-agents/<key>` to its key (or null if malformed / not an agent ref).
```ts
subAgentKey(ref: string): string | null
```
**Parameters:**
- `ref: string`
**Returns:** `string | null`

### `childKeys`
Direct sub-agent keys of an agent (decoded; may include dangling keys — the caller lint-checks existence).
```ts
childKeys(agent: SulukAgent): { local: string; key: string | null; ref: string }[]
```
**Parameters:**
- `agent: SulukAgent`
**Returns:** `{ local: string; key: string | null; ref: string }[]`

### `findCycle`
Detect a cycle in the agent graph reachable from `root`, following by-name sub-agent refs. Returns the cycle
path (keys) if one exists, else null. JSON-Schema cannot express acyclicity — this is the author/install lint
the C027 gate requires. (Same shape as the shipped builder/compose cycle detection, C021.)
```ts
findCycle(map: Record<string, SulukAgent>, root: string): string[] | null
```
**Parameters:**
- `map: Record<string, SulukAgent>`
- `root: string`
**Returns:** `string[] | null`

### `subtreeDepth`
Longest sub-agent path depth below `root` (a leaf — no sub-agents — is depth 0). Returns Infinity if a cycle is
reachable. `maxDepth` on an agent must be >= this for its subtree.
```ts
subtreeDepth(map: Record<string, SulukAgent>, root: string, seen: Set<string>): number
```
**Parameters:**
- `map: Record<string, SulukAgent>`
- `root: string`
- `seen: Set<string>` — default: `...`
**Returns:** `number`

### `deepStrings`
Every string value reachable in an object (for the request-value-selector D1 scan).
```ts
deepStrings(v: unknown, path: string): Generator<{ path: string; value: string }>
```
**Parameters:**
- `v: unknown`
- `path: string` — default: `""`
**Returns:** `Generator<{ path: string; value: string }>`

### `resolveInstruction`
Resolve a pinned instruction snapshot from an `instructions` map, accepting BOTH key conventions used across the
package: the QUALIFIED `"<agent>/<skill>"` key (unambiguous — two agents can share a skill name; the convention
`context`/`grade` use) and the bare `"<skill>"` key (the original projection convention; back-compat). Qualified wins.
One resolver everywhere means a single instructions map works for every projection AND the grade/context analyzer.
```ts
resolveInstruction(instructions: Record<string, string> | undefined, agentName: string, skillName: string): string | undefined
```
**Parameters:**
- `instructions: Record<string, string> | undefined`
- `agentName: string`
- `skillName: string`
**Returns:** `string | undefined`
