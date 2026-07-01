[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / AgentGradeFinding

# Interface: AgentGradeFinding

Defined in: [agents/src/grade.ts:36](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/agents/src/grade.ts#L36)

## Properties

### code

> **code**: `string`

Defined in: [agents/src/grade.ts:40](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/agents/src/grade.ts#L40)

machine code (carried through from the source check, e.g. "missing-max-depth", "no-fitting-model", "no-tiering").

***

### detail

> **detail**: `string`

Defined in: [agents/src/grade.ts:41](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/agents/src/grade.ts#L41)

***

### dimension

> **dimension**: [`GradeDimension`](../type-aliases/GradeDimension.md)

Defined in: [agents/src/grade.ts:37](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/agents/src/grade.ts#L37)

***

### fix?

> `optional` **fix?**: `string`

Defined in: [agents/src/grade.ts:43](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/agents/src/grade.ts#L43)

a concrete remedy where the source check (or this one) provides one.

***

### severity

> **severity**: [`GradeSeverity`](../type-aliases/GradeSeverity.md)

Defined in: [agents/src/grade.ts:38](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/agents/src/grade.ts#L38)
