[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / findCycle

# Function: findCycle()

> **findCycle**(`map`, `root`): `string`[] \| `null`

Defined in: [agents/src/resolve.ts:72](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/agents/src/resolve.ts#L72)

Detect a cycle in the agent graph reachable from `root`, following by-name sub-agent refs. Returns the cycle
path (keys) if one exists, else null. JSON-Schema cannot express acyclicity — this is the author/install lint
the C027 gate requires. (Same shape as the shipped builder/compose cycle detection, C021.)

## Parameters

### map

`Record`\<`string`, [`SulukAgent`](../../core/interfaces/SulukAgent.md)\>

### root

`string`

## Returns

`string`[] \| `null`
