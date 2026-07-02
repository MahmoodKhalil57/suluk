[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / CloudflareAgentArtifacts

# Interface: CloudflareAgentArtifacts

Defined in: [agents/src/cloudflare.ts:35](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/cloudflare.ts#L35)

## Properties

### durableObjects

> **durableObjects**: `object`[]

Defined in: [agents/src/cloudflare.ts:40](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/cloudflare.ts#L40)

ONE entry per reachable agent (root + transitive sub-agents) — feed straight to `@suluk/deploy`'s `durableObjects`
 / `@suluk/cloudflare`'s `DeployPlan.durableObjects` (Stage 1.1/1.2); each becomes a bound + migrated Durable Object.

#### binding

> **binding**: `string`

#### className

> **className**: `string`

***

### files

> **files**: `Record`\<`string`, `string`\>

Defined in: [agents/src/cloudflare.ts:37](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/cloudflare.ts#L37)

path → owned source the user writes into their Worker project (one agent file per REACHABLE agent + the worker).

***

### reachableSubAgents

> **reachableSubAgents**: `string`[]

Defined in: [agents/src/cloudflare.ts:42](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/cloudflare.ts#L42)

the reachable sub-agent KEYS (x-suluk-agents map keys), each now scaffolded as its own file (cross-agent DISPATCH is yours to wire).
