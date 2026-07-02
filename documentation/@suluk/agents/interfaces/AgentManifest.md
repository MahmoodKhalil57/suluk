[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / AgentManifest

# Interface: AgentManifest

Defined in: [agents/src/manifest.ts:59](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/manifest.ts#L59)

## Properties

### agent

> **agent**: `string`

Defined in: [agents/src/manifest.ts:61](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/manifest.ts#L61)

***

### escalations

> **escalations**: [`ScopeEscalation`](ScopeEscalation.md)[]

Defined in: [agents/src/manifest.ts:67](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/manifest.ts#L67)

any per-edge scope escalations (an installable agent has none).

***

### manifestVersion

> **manifestVersion**: `1`

Defined in: [agents/src/manifest.ts:60](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/manifest.ts#L60)

***

### nodes

> **nodes**: [`AgentManifestNode`](AgentManifestNode.md)[]

Defined in: [agents/src/manifest.ts:63](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/manifest.ts#L63)

the root + every transitively-reachable sub-agent, sorted by name (canonical).

***

### reachable

> **reachable**: `object`

Defined in: [agents/src/manifest.ts:65](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/manifest.ts#L65)

the statically-enumerable worst-case reachable surface.

#### agents

> **agents**: `string`[]

#### tools

> **tools**: `string`[]
