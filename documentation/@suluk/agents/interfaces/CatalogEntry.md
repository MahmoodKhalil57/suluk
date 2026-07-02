[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / CatalogEntry

# Interface: CatalogEntry

Defined in: [agents/src/resources.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/agents/src/resources.ts#L24)

One entry in an agent's loadable catalog — the CF Agent-Skill `get()` listing (what appears in the system prompt).

## Properties

### description

> **description**: `string`

Defined in: [agents/src/resources.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/agents/src/resources.ts#L29)

***

### key

> **key**: `string`

Defined in: [agents/src/resources.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/agents/src/resources.ts#L26)

the resource key in `x-suluk-resources`.

***

### kind

> **kind**: `"instructions"` \| `"reference"` \| `"script"`

Defined in: [agents/src/resources.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/agents/src/resources.ts#L30)

***

### local

> **local**: `string`

Defined in: [agents/src/resources.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/agents/src/resources.ts#L28)

the agent's local ref name (the `resources` map key).

***

### provenance

> **provenance**: `object`

Defined in: [agents/src/resources.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/agents/src/resources.ts#L32)

#### contentHash

> **contentHash**: `string`

#### source

> **source**: `string`

#### version?

> `optional` **version?**: `string`

***

### trust

> **trust**: `"author-declared"` \| `"retrieved"`

Defined in: [agents/src/resources.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/agents/src/resources.ts#L31)
