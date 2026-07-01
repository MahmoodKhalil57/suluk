[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/deploy](../README.md) / DeployProvider

# Interface: DeployProvider

Defined in: [types.ts:90](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/deploy/src/types.ts#L90)

A deployment target. Pure: it produces the plan; the host executes the steps (with the user's credentials).

## Properties

### name

> **name**: `string`

Defined in: [types.ts:91](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/deploy/src/types.ts#L91)

## Methods

### generate()

> **generate**(`input`): [`DeployPlan`](DeployPlan.md)

Defined in: [types.ts:92](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/deploy/src/types.ts#L92)

#### Parameters

##### input

[`DeployInput`](DeployInput.md)

#### Returns

[`DeployPlan`](DeployPlan.md)
