[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / residentToolNames

# Function: residentToolNames()

> **residentToolNames**(`doc`, `agentName`): `string`[]

Defined in: [agents/src/conformance.ts:72](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/agents/src/conformance.ts#L72)

The RESIDENT served-tool NAMES across an agent's whole REACHABLE surface (C027 tier-trim serving) — every route key
(the served wire id) whose `tier` is not `cold-tail`, across the agent AND its transitively-reachable sub-agents.
Feed this to `@suluk/mcp` `mcpApp({ resident })`: the cold-tail is then withheld from the default `tools/list` and
revealed on demand via `discover_tools`, never widening the declared surface. This is the runtime SERVING
counterpart to `projectOpenRouter`'s resident/discoverable split — together they make the over-serve gap closeable.
(Cycle-safe; mirrors `reachableSurface`.)

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### agentName

`string`

## Returns

`string`[]
