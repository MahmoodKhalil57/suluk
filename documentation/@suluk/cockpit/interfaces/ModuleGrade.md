[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / ModuleGrade

# Interface: ModuleGrade

Defined in: [builder/src/module.ts:269](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/builder/src/module.ts#L269)

## Properties

### costCoverage

> **costCoverage**: `number`

Defined in: [builder/src/module.ts:274](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/builder/src/module.ts#L274)

fraction of the module's operations that declare a cost (the real, author-attributable signal).

***

### grade

> **grade**: `"A"` \| `"B"` \| `"C"`

Defined in: [builder/src/module.ts:270](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/builder/src/module.ts#L270)

***

### notes

> **notes**: `string`[]

Defined in: [builder/src/module.ts:277](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/builder/src/module.ts#L277)

***

### score

> **score**: `number`

Defined in: [builder/src/module.ts:272](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/builder/src/module.ts#L272)

0..1 — cost-declaration coverage minus a documentation-warning penalty.

***

### warnings

> **warnings**: `number`

Defined in: [builder/src/module.ts:276](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/builder/src/module.ts#L276)

real documentation problems (audit `warn`s) on the module's authored ops.
