[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / LayerReport

# Interface: LayerReport

Defined in: [agents/src/pyramid.ts:67](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/pyramid.ts#L67)

## Properties

### byLevel

> **byLevel**: `Record`\<`number`, `string`[]\>

Defined in: [agents/src/pyramid.ts:71](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/pyramid.ts#L71)

level → agent names at that level (cyclic agents are grouped under `-1`).

***

### floor

> **floor**: `string`[]

Defined in: [agents/src/pyramid.ts:75](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/pyramid.ts#L75)

the distinct route `operationRef`s forming the deterministic floor across all agents (level 0).

***

### layers

> **layers**: [`AgentLayer`](AgentLayer.md)[]

Defined in: [agents/src/pyramid.ts:69](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/pyramid.ts#L69)

one row per agent, sorted by (level asc, then name).

***

### maxLevel

> **maxLevel**: `number`

Defined in: [agents/src/pyramid.ts:73](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/pyramid.ts#L73)

the tallest FINITE agent level (0 when there are no agents).
