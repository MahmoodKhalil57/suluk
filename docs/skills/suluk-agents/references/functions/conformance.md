# Functions

## conformance

### `reachableSurface`
The statically-enumerable reachable surface of an agent: its own route keys (the wire ids) + every route key of
every transitively-reachable sub-agent. Worst-case authz reach, computed with ZERO requests. (Cycle-safe.)
```ts
reachableSurface(doc: OpenAPIv4Document, agentName: string): { tools: string[]; agents: string[] }
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `agentName: string`
**Returns:** `{ tools: string[]; agents: string[] }`

### `residentSurface`
The RESIDENT surface of an agent (C027) — its own routes whose `tier` is not `cold-tail` (the default-visible
tool set). Cold-tail routes are revealed via `discover_tools`, never in the default list. This is the set a
conforming serving adapter must trim to for the context-reduction claim to bind.
```ts
residentSurface(doc: OpenAPIv4Document, agentName: string): string[]
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `agentName: string`
**Returns:** `string[]`

### `residentToolNames`
The RESIDENT served-tool NAMES across an agent's whole REACHABLE surface (C027 tier-trim serving) — every route key
(the served wire id) whose `tier` is not `cold-tail`, across the agent AND its transitively-reachable sub-agents.
Feed this to `@suluk/mcp` `mcpApp({ resident })`: the cold-tail is then withheld from the default `tools/list` and
revealed on demand via `discover_tools`, never widening the declared surface. This is the runtime SERVING
counterpart to `projectOpenRouter`'s resident/discoverable split — together they make the over-serve gap closeable.
(Cycle-safe; mirrors `reachableSurface`.)
```ts
residentToolNames(doc: OpenAPIv4Document, agentName: string): string[]
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `agentName: string`
**Returns:** `string[]`

### `assertServedSubset`
OVER-SERVE auditor: assert the tools a server actually exposes are a SUBSET of the declared reachable surface.
Any served tool NOT in the surface is a WIDENING — the contract is no longer the source of truth for authz reach.
```ts
assertServedSubset(doc: OpenAPIv4Document, agentName: string, servedToolNames: string[]): ConformanceFinding[]
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `agentName: string`
- `servedToolNames: string[]`
**Returns:** `ConformanceFinding[]`

### `assertServedSubsetGoverned`
POLICY-AWARE OVER-SERVE (C028): when an operator policy governs the agent, the served tools must be a subset of
the POST-POLICY effective surface — a served tool the operator DENIED is a conformance failure (the operator cap
must hold on the wire). With no governing policy this is identical to assertServedSubset.
```ts
assertServedSubsetGoverned(doc: OpenAPIv4Document, agentName: string, servedToolNames: string[]): ConformanceFinding[]
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `agentName: string`
- `servedToolNames: string[]`
**Returns:** `ConformanceFinding[]`

### `assertDefaultServedResident`
TIER-TRIM CONFORMANCE: the DEFAULT served tool set must contain NO cold-tail tool (those belong behind
`discover_tools`). A cold-tail tool in the default list is a silent no-op of the tier label — the reduction the
tiering thesis promises is not actually being delivered on the served path.
```ts
assertDefaultServedResident(doc: OpenAPIv4Document, agentName: string, defaultServedToolNames: string[]): ConformanceFinding[]
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `agentName: string`
- `defaultServedToolNames: string[]`
**Returns:** `ConformanceFinding[]`

### `verifySkillFreshness`
SKILL-FRESHNESS: a skill's declared `provenance.contentHash` must match the hash of the CURRENT served snapshot.
A mismatch means the served preprompt drifted after the contentHash was minted — an unsigned change in production
(the C021 supply-chain concern). No declared hash ⇒ a warning (drift is undetectable).
```ts
verifySkillFreshness(declaredHash: string | undefined, currentSnapshot: string): ConformanceFinding[]
```
**Parameters:**
- `declaredHash: string | undefined`
- `currentSnapshot: string`
**Returns:** `ConformanceFinding[]`

### `conformanceOk`
True ⇒ no error-severity conformance findings (warnings are advisory). Mirrors `lintOk` — the served-fact gate.
```ts
conformanceOk(findings: ConformanceFinding[]): boolean
```
**Parameters:**
- `findings: ConformanceFinding[]`
**Returns:** `boolean`
