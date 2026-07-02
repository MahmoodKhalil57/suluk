[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / AgentManifestNode

# Interface: AgentManifestNode

Defined in: [agents/src/manifest.ts:44](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/agents/src/manifest.ts#L44)

## Properties

### description

> **description**: `string`

Defined in: [agents/src/manifest.ts:46](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/agents/src/manifest.ts#L46)

***

### effectiveScope

> **effectiveScope**: [`Scope`](../type-aliases/Scope.md)

Defined in: [agents/src/manifest.ts:48](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/agents/src/manifest.ts#L48)

effective scope after intersection along the reaching path (null = unconstrained).

***

### governed?

> `optional` **governed?**: [`AgentManifestGoverned`](AgentManifestGoverned.md)

Defined in: [agents/src/manifest.ts:53](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/agents/src/manifest.ts#L53)

operator-effective surface after x-suluk-policy (C028) — so the C021 signature covers the operator's caps.

***

### modelSelection?

> `optional` **modelSelection?**: `object`[]

Defined in: [agents/src/manifest.ts:57](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/agents/src/manifest.ts#L57)

catalog-pinned model selection per skill (present only when agentManifest is given a catalog) — reproducible: the
snapshotHash is signed (the SURVIVOR SET), so a re-pick week-over-week with no author edit is auditable. `resolve`
is the C030 mode; `pickPinned` false ⇒ set-pinned but the served id is NOT reproducible (router/latest).

#### from

> **from**: `"declared"` \| `"selected"`

#### ids

> **ids**: `string`[]

#### pickPinned

> **pickPinned**: `boolean`

#### resolve

> **resolve**: `"pinned"` \| `"router"` \| `"latest"`

#### skill

> **skill**: `string`

#### snapshotHash

> **snapshotHash**: `string` \| `null`

***

### name

> **name**: `string`

Defined in: [agents/src/manifest.ts:45](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/agents/src/manifest.ts#L45)

***

### routes

> **routes**: [`AgentManifestRoute`](AgentManifestRoute.md)[]

Defined in: [agents/src/manifest.ts:50](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/agents/src/manifest.ts#L50)

***

### skills

> **skills**: [`AgentManifestSkill`](AgentManifestSkill.md)[]

Defined in: [agents/src/manifest.ts:49](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/agents/src/manifest.ts#L49)

***

### subAgents

> **subAgents**: `string`[]

Defined in: [agents/src/manifest.ts:51](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/agents/src/manifest.ts#L51)
