[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / OpenRouterAgentManifest

# Interface: OpenRouterAgentManifest

Defined in: [agents/src/project.ts:87](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/agents/src/project.ts#L87)

## Properties

### discoverable

> **discoverable**: [`OpenRouterFunctionTool`](OpenRouterFunctionTool.md)[]

Defined in: [agents/src/project.ts:100](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/agents/src/project.ts#L100)

COLD-TAIL routes — NOT in the default surface; revealed on demand via `discover_tools`.

***

### instructions

> **instructions**: `object`

Defined in: [agents/src/project.ts:93](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/agents/src/project.ts#L93)

a POINTER to the served instructions + the pinned hash — never inlined creds, never the full text by default.

#### contentHash?

> `optional` **contentHash?**: `string`

#### source?

> `optional` **source?**: `string`

#### version?

> `optional` **version?**: `string`

***

### model

> **model**: `string`[]

Defined in: [agents/src/project.ts:90](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/agents/src/project.ts#L90)

model preference list (cheap→capable) from the primary skill; the OpenRouter ids to try in order.

***

### name

> **name**: `string`

Defined in: [agents/src/project.ts:88](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/agents/src/project.ts#L88)

***

### subAgents

> **subAgents**: `object`[]

Defined in: [agents/src/project.ts:102](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/agents/src/project.ts#L102)

sub-agents → one front-door tool each (dispatched as a NEW completion at the child's tier).

#### name

> **name**: `string`

#### ref

> **ref**: `string`

***

### tier?

> `optional` **tier?**: `"resident"` \| `"cold-tail"`

Defined in: [agents/src/project.ts:91](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/agents/src/project.ts#L91)

***

### tools

> **tools**: [`OpenRouterFunctionTool`](OpenRouterFunctionTool.md)[]

Defined in: [agents/src/project.ts:98](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/agents/src/project.ts#L98)

The DEFAULT tool surface — RESIDENT routes only, plus a synthetic `discover_tools` when cold-tail routes exist.
This is the tier-trim: the cheap/lower tier carries a SMALLER tool surface (the conditional context reduction).
