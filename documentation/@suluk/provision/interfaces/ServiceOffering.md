[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / ServiceOffering

# Interface: ServiceOffering

Defined in: [provision/src/types.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/provision/src/types.ts#L23)

What a broker can provision (OSB Service Offering). `bindable` = provisioning yields credentials/config to bind.

## Properties

### bindable

> **bindable**: `boolean`

Defined in: [provision/src/types.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/provision/src/types.ts#L28)

***

### description

> **description**: `string`

Defined in: [provision/src/types.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/provision/src/types.ts#L27)

***

### id

> **id**: `string`

Defined in: [provision/src/types.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/provision/src/types.ts#L25)

the stable broker id used in a config's `service`, e.g. "cloudflare-d1".

***

### name

> **name**: `string`

Defined in: [provision/src/types.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/provision/src/types.ts#L26)

***

### plans

> **plans**: [`ServicePlan`](ServicePlan.md)[]

Defined in: [provision/src/types.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/provision/src/types.ts#L29)
