[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / resolveInstruction

# Function: resolveInstruction()

> **resolveInstruction**(`instructions`, `agentName`, `skillName`): `string` \| `undefined`

Defined in: [agents/src/resolve.ts:118](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/resolve.ts#L118)

Resolve a pinned instruction snapshot from an `instructions` map, accepting BOTH key conventions used across the
package: the QUALIFIED `"<agent>/<skill>"` key (unambiguous — two agents can share a skill name; the convention
`context`/`grade` use) and the bare `"<skill>"` key (the original projection convention; back-compat). Qualified wins.
One resolver everywhere means a single instructions map works for every projection AND the grade/context analyzer.

## Parameters

### instructions

`Record`\<`string`, `string`\> \| `undefined`

### agentName

`string`

### skillName

`string`

## Returns

`string` \| `undefined`
