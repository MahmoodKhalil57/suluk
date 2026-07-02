[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / EffectiveAgent

# Interface: EffectiveAgent

Defined in: [agents/src/policy.ts:36](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/policy.ts#L36)

## Properties

### agent

> **agent**: `string`

Defined in: [agents/src/policy.ts:37](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/policy.ts#L37)

***

### allowedSubAgents

> **allowedSubAgents**: `string`[]

Defined in: [agents/src/policy.ts:45](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/policy.ts#L45)

***

### allowedTools

> **allowedTools**: `string`[]

Defined in: [agents/src/policy.ts:43](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/policy.ts#L43)

***

### deniedSubAgents

> **deniedSubAgents**: `string`[]

Defined in: [agents/src/policy.ts:46](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/policy.ts#L46)

***

### deniedTools

> **deniedTools**: `string`[]

Defined in: [agents/src/policy.ts:44](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/policy.ts#L44)

***

### maxDepth?

> `optional` **maxDepth?**: `number`

Defined in: [agents/src/policy.ts:40](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/policy.ts#L40)

***

### nestingForbidden

> **nestingForbidden**: `boolean`

Defined in: [agents/src/policy.ts:41](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/policy.ts#L41)

***

### scope

> **scope**: [`Scope`](../type-aliases/Scope.md)

Defined in: [agents/src/policy.ts:39](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/policy.ts#L39)

INTERSECT(agent.scope, policy.scopeAllowlist).

***

### skills

> **skills**: [`EffectiveSkill`](EffectiveSkill.md)[]

Defined in: [agents/src/policy.ts:42](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/policy.ts#L42)
