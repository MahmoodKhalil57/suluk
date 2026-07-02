[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / DiagramNode

# Interface: DiagramNode

Defined in: [agents/src/diagram.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/agents/src/diagram.ts#L14)

## Properties

### badges

> **badges**: `string`[]

Defined in: [agents/src/diagram.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/agents/src/diagram.ts#L20)

short pills shown on hover (model / scope / guarantee / tier / trust / maxDepth …).

***

### children?

> `optional` **children?**: `DiagramNode`[]

Defined in: [agents/src/diagram.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/agents/src/diagram.ts#L25)

***

### collapsed?

> `optional` **collapsed?**: `boolean`

Defined in: [agents/src/diagram.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/agents/src/diagram.ts#L24)

start collapsed (the cold-tail does, so the default view stays high-level).

***

### id

> **id**: `string`

Defined in: [agents/src/diagram.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/agents/src/diagram.ts#L15)

***

### kind

> **kind**: [`DiagramKind`](../type-aliases/DiagramKind.md)

Defined in: [agents/src/diagram.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/agents/src/diagram.ts#L17)

***

### label

> **label**: `string`

Defined in: [agents/src/diagram.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/agents/src/diagram.ts#L16)

***

### note?

> `optional` **note?**: `string`

Defined in: [agents/src/diagram.ts:22](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/agents/src/diagram.ts#L22)

a one-liner under the title (the agent description / the skill `whenToUse`).

***

### tier?

> `optional` **tier?**: `"resident"` \| `"cold-tail"`

Defined in: [agents/src/diagram.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/agents/src/diagram.ts#L18)
