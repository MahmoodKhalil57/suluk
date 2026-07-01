[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / previewDeployPlan

# Function: previewDeployPlan()

> **previewDeployPlan**(`doc`): [`DeployPlan`](../interfaces/DeployPlan.md)

Defined in: [cockpit/src/deploy.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/cockpit/src/deploy.ts#L27)

Build the PREVIEW deploy plan (charter-bounded role-preview): a `${slug}-preview` Worker with the two
fail-closed locks + a seed.sql for the contract's roles. Terminal-gated identically to prod — Suluk holds no
infra token; the USER runs wrangler. The seeded roles come from the contract (previewRoles), never hardcoded.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

## Returns

[`DeployPlan`](../interfaces/DeployPlan.md)
