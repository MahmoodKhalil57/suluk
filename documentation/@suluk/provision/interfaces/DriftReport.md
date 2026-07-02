[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / DriftReport

# Interface: DriftReport

Defined in: [provision/src/check.ts:10](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/provision/src/check.ts#L10)

## Properties

### clean

> **clean**: `boolean`

Defined in: [provision/src/check.ts:11](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/provision/src/check.ts#L11)

***

### drift

> **drift**: [`PlanStep`](PlanStep.md)[]

Defined in: [provision/src/check.ts:13](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/provision/src/check.ts#L13)

the steps that would change something (create/update/deprovision) — empty when in sync.

***

### orphans

> **orphans**: `string`[]

Defined in: [provision/src/check.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/provision/src/check.ts#L14)
