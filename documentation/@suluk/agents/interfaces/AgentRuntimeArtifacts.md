[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / AgentRuntimeArtifacts

# Interface: AgentRuntimeArtifacts

Defined in: [agents/src/runtime.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/runtime.ts#L29)

What every runtime adapter returns: owned source + the reachable sub-agent list + the deploy hint.

## Properties

### deploy

> **deploy**: [`RuntimeDeployHint`](../type-aliases/RuntimeDeployHint.md)

Defined in: [agents/src/runtime.ts:35](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/runtime.ts#L35)

provider-specific deploy descriptor (Cloudflare → `@suluk/deploy`'s `durableObjects`; Node → none).

***

### files

> **files**: `Record`\<`string`, `string`\>

Defined in: [agents/src/runtime.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/runtime.ts#L31)

path → owned source the user writes into their project.

***

### reachableSubAgents

> **reachableSubAgents**: `string`[]

Defined in: [agents/src/runtime.ts:33](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/runtime.ts#L33)

reachable sub-agents (each a separate runtime unit; scaffold per provider).
