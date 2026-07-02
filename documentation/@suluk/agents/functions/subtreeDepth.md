[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / subtreeDepth

# Function: subtreeDepth()

> **subtreeDepth**(`map`, `root`, `seen?`): `number`

Defined in: [agents/src/resolve.ts:93](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/agents/src/resolve.ts#L93)

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
