[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / agenticPatterns

# Function: agenticPatterns()

> **agenticPatterns**(`doc`, `name`): [`PatternAffordance`](../interfaces/PatternAffordance.md)[]

Defined in: [agents/src/patterns.ts:40](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/agents/src/patterns.ts#L40)

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
