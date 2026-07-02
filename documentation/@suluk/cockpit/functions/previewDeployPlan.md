[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / previewDeployPlan

# Function: previewDeployPlan()

> **previewDeployPlan**(`doc`): [`DeployPlan`](../interfaces/DeployPlan.md)

Defined in: [cockpit/src/deploy.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/cockpit/src/deploy.ts#L27)

Build the PREVIEW deploy plan (charter-bounded role-preview): a `${slug}-preview` Worker with the two
fail-closed locks + a seed.sql for the contract's roles. Terminal-gated identically to prod — Suluk holds no
infra token; the USER runs wrangler. The seeded roles come from the contract (previewRoles), never hardcoded.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

## Returns

[`DeployPlan`](../interfaces/DeployPlan.md)
