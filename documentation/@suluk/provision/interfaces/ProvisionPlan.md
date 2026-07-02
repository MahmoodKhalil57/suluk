[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / ProvisionPlan

# Interface: ProvisionPlan

Defined in: [provision/src/plan.ts:22](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/provision/src/plan.ts#L22)

## Properties

### clean

> **clean**: `boolean`

Defined in: [provision/src/plan.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/provision/src/plan.ts#L27)

true when every step is a noop and there are no (prunable) orphans — the `check` CI gate passes on this.

***

### orphans

> **orphans**: `string`[]

Defined in: [provision/src/plan.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/provision/src/plan.ts#L25)

refs present in state but absent from config — deprovisioned only when pruning is on (else surfaced, not touched).

***

### steps

> **steps**: [`PlanStep`](PlanStep.md)[]

Defined in: [provision/src/plan.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/provision/src/plan.ts#L23)
