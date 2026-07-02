[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / ServiceRef

# Type Alias: ServiceRef

> **ServiceRef** = `string` \| [`Service`](../interfaces/Service.md)\<`any`, `any`\>

Defined in: [manifest.ts:40](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/platform/src/manifest.ts#L40)

A reference to a service: an imported [Service](../interfaces/Service.md) object (fully typed) or a bare string id (resolved against the
 catalog; opts typed as `unknown`).
