[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / agentLevel

# Function: agentLevel()

> **agentLevel**(`doc`, `name`): `number`

Defined in: [agents/src/pyramid.ts:33](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/agents/src/pyramid.ts#L33)

An agent's pyramid LEVEL: its composition height above the deterministic route-floor. A leaf agent (skills/routes
only, no sub-agents) is **1** (it composes only the floor). An agent that composes sub-agents is **1 + max(child
level)**. Returns `FLOOR_LEVEL` (0) for any name that is NOT an orchestrating agent (a route/leaf capability — it
lives on the floor). Returns `Infinity` when a sub-agent cycle makes the height unbounded (a contract defect the
cycle-linter / grade already fail on). Cycle-safe via the shared `subtreeDepth` seen-guard. Never read by D1.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### name

`string`

## Returns

`number`
