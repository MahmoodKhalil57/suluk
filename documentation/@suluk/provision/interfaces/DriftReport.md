[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / DriftReport

# Interface: DriftReport

Defined in: [provision/src/check.ts:10](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/provision/src/check.ts#L10)

## Properties

### clean

> **clean**: `boolean`

Defined in: [provision/src/check.ts:11](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/provision/src/check.ts#L11)

***

### drift

> **drift**: [`PlanStep`](PlanStep.md)[]

Defined in: [provision/src/check.ts:13](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/provision/src/check.ts#L13)

the steps that would change something (create/update/deprovision) — empty when in sync.

***

### orphans

> **orphans**: `string`[]

Defined in: [provision/src/check.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/provision/src/check.ts#L14)
