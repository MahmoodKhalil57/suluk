[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / SkillModelResolution

# Interface: SkillModelResolution

Defined in: [agents/src/model-select.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/agents/src/model-select.ts#L24)

## Properties

### from

> **from**: `"declared"` \| `"selected"`

Defined in: [agents/src/model-select.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/agents/src/model-select.ts#L26)

***

### ids

> **ids**: `string`[]

Defined in: [agents/src/model-select.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/agents/src/model-select.ts#L25)

***

### pickPinned

> **pickPinned**: `boolean`

Defined in: [agents/src/model-select.ts:34](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/agents/src/model-select.ts#L34)

true ⇒ the SERVED model id is reproducible (pinned). false ⇒ set-pinned but pick-NOT-pinned (router/latest).

***

### selection?

> `optional` **selection?**: [`SelectResult`](SelectResult.md)

Defined in: [agents/src/model-select.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/agents/src/model-select.ts#L28)

the selector result (filter trace + per-axis why + coverage gaps) when `from === "selected"`.

***

### snapshotHash

> **snapshotHash**: `string` \| `null`

Defined in: [agents/src/model-select.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/agents/src/model-select.ts#L30)

the catalog snapshot the SURVIVOR SET was pinned against (null when declared).

***

### target

> **target**: [`ResolvedTarget`](../type-aliases/ResolvedTarget.md)

Defined in: [agents/src/model-select.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/agents/src/model-select.ts#L32)

the resolved runtime target (pin / router / latest).
