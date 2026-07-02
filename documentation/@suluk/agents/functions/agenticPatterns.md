[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / agenticPatterns

# Function: agenticPatterns()

> **agenticPatterns**(`doc`, `name`): [`PatternAffordance`](../interfaces/PatternAffordance.md)[]

Defined in: [agents/src/patterns.ts:40](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/agents/src/patterns.ts#L40)

The agentic patterns an agent's composition SHAPE affords (advisory; the runtime picks the actual trajectory).
Returns `[]` for a flat agent (no sub-agents, no multi-round thinking) — a single-step tool-user affords none of
the multi-step patterns. Unknown agent name ⇒ `[]`.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### name

`string`

## Returns

[`PatternAffordance`](../interfaces/PatternAffordance.md)[]
