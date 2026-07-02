[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/deploy](../README.md) / DeployProvider

# Interface: DeployProvider

Defined in: [types.ts:90](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/deploy/src/types.ts#L90)

A deployment target. Pure: it produces the plan; the host executes the steps (with the user's credentials).

## Properties

### name

> **name**: `string`

Defined in: [types.ts:91](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/deploy/src/types.ts#L91)

## Methods

### generate()

> **generate**(`input`): [`DeployPlan`](DeployPlan.md)

Defined in: [types.ts:92](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/deploy/src/types.ts#L92)

#### Parameters

##### input

[`DeployInput`](DeployInput.md)

#### Returns

[`DeployPlan`](DeployPlan.md)
