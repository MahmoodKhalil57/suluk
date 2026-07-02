[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / plan

# Function: plan()

> **plan**(`config`, `state`, `prune?`): [`ProvisionPlan`](../interfaces/ProvisionPlan.md)

Defined in: [provision/src/plan.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/provision/src/plan.ts#L32)

Diff `config` against `state`. Desired instances are emitted in binding-DAG order (create/update/noop); orphans
 (state − config) become `deprovision` steps only when `prune` (the config default, or an override) is on.

## Parameters

### config

[`ProvisionConfig`](../interfaces/ProvisionConfig.md)

### state

[`InstanceState`](../interfaces/InstanceState.md)[]

### prune?

`boolean` = `...`

## Returns

[`ProvisionPlan`](../interfaces/ProvisionPlan.md)
