[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / DeployProvider

# Interface: DeployProvider

Defined in: [deploy/src/types.ts:90](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/deploy/src/types.ts#L90)

A deployment target. Pure: it produces the plan; the host executes the steps (with the user's credentials).

## Properties

### name

> **name**: `string`

Defined in: [deploy/src/types.ts:91](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/deploy/src/types.ts#L91)

## Methods

### generate()

> **generate**(`input`): [`DeployPlan`](DeployPlan.md)

Defined in: [deploy/src/types.ts:92](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/deploy/src/types.ts#L92)

#### Parameters

##### input

[`DeployInput`](../../deploy/interfaces/DeployInput.md)

#### Returns

[`DeployPlan`](DeployPlan.md)
