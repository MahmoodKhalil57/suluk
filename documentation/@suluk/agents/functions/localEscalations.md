[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / localEscalations

# Function: localEscalations()

> **localEscalations**(`doc`, `agentName`): [`ScopeEscalation`](../interfaces/ScopeEscalation.md)[]

Defined in: [agents/src/scope.ts:65](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/agents/src/scope.ts#L65)

A LOCAL author-time escalation check for one agent's direct children: a child may not DECLARE a permission its
immediate parent does not grant (under intersection it would be silently dropped — flag the author's confusion /
a confused-deputy attempt). Used by the linter; the transitive picture is [analyzeScopes](analyzeScopes.md).

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### agentName

`string`

## Returns

[`ScopeEscalation`](../interfaces/ScopeEscalation.md)[]
