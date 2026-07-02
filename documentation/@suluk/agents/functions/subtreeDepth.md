[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / subtreeDepth

# Function: subtreeDepth()

> **subtreeDepth**(`map`, `root`, `seen?`): `number`

Defined in: [agents/src/resolve.ts:93](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/agents/src/resolve.ts#L93)

Longest sub-agent path depth below `root` (a leaf — no sub-agents — is depth 0). Returns Infinity if a cycle is
reachable. `maxDepth` on an agent must be >= this for its subtree.

## Parameters

### map

`Record`\<`string`, [`SulukAgent`](../../core/interfaces/SulukAgent.md)\>

### root

`string`

### seen?

`Set`\<`string`\> = `...`

## Returns

`number`
