[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / previewAllowedRoles

# Function: previewAllowedRoles()

> **previewAllowedRoles**(`doc`): `string`[]

Defined in: [cockpit/src/crosscut.ts:139](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/cockpit/src/crosscut.ts#L139)

The roles a preview may be minted AS — the authenticated principals, EXCLUDING the login-less `anonymous`. This
is the ONE source for the deployed gate's allow-list AND for which demo users seed.sql seeds; keeping them equal
means a role can be previewed iff it is seeded iff the gate allows it (no allow-but-unseedable divergence).

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

## Returns

`string`[]
