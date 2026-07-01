[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / ModuleGrade

# Interface: ModuleGrade

Defined in: [builder/src/module.ts:269](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/builder/src/module.ts#L269)

## Properties

### costCoverage

> **costCoverage**: `number`

Defined in: [builder/src/module.ts:274](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/builder/src/module.ts#L274)

fraction of the module's operations that declare a cost (the real, author-attributable signal).

***

### grade

> **grade**: `"A"` \| `"B"` \| `"C"`

Defined in: [builder/src/module.ts:270](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/builder/src/module.ts#L270)

***

### notes

> **notes**: `string`[]

Defined in: [builder/src/module.ts:277](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/builder/src/module.ts#L277)

***

### score

> **score**: `number`

Defined in: [builder/src/module.ts:272](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/builder/src/module.ts#L272)

0..1 — cost-declaration coverage minus a documentation-warning penalty.

***

### warnings

> **warnings**: `number`

Defined in: [builder/src/module.ts:276](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/builder/src/module.ts#L276)

real documentation problems (audit `warn`s) on the module's authored ops.
