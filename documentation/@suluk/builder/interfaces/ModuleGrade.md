[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / ModuleGrade

# Interface: ModuleGrade

Defined in: [module.ts:269](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/builder/src/module.ts#L269)

## Properties

### costCoverage

> **costCoverage**: `number`

Defined in: [module.ts:274](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/builder/src/module.ts#L274)

fraction of the module's operations that declare a cost (the real, author-attributable signal).

***

### grade

> **grade**: `"A"` \| `"B"` \| `"C"`

Defined in: [module.ts:270](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/builder/src/module.ts#L270)

***

### notes

> **notes**: `string`[]

Defined in: [module.ts:277](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/builder/src/module.ts#L277)

***

### score

> **score**: `number`

Defined in: [module.ts:272](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/builder/src/module.ts#L272)

0..1 — cost-declaration coverage minus a documentation-warning penalty.

***

### warnings

> **warnings**: `number`

Defined in: [module.ts:276](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/builder/src/module.ts#L276)

real documentation problems (audit `warn`s) on the module's authored ops.
