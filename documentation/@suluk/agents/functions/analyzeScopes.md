[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / analyzeScopes

# Function: analyzeScopes()

> **analyzeScopes**(`doc`, `root`): `object`

Defined in: [agents/src/scope.ts:33](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/agents/src/scope.ts#L33)

Walk the agent tree from `root`, computing each reachable node's effective (intersected) scope and every per-edge
escalation. Cycle-guarded (lint rejects cycles independently); on a DAG/tree each node's effective is its first
reaching path's intersection — sufficient for the shallow agent graphs C027 ships.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### root

`string`

## Returns

`object`

### effective

> **effective**: `Record`\<`string`, [`Scope`](../type-aliases/Scope.md)\>

### escalations

> **escalations**: [`ScopeEscalation`](../interfaces/ScopeEscalation.md)[]
