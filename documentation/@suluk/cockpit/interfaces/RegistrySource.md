[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / RegistrySource

# Interface: RegistrySource

Defined in: [builder/src/registry-remote.ts:12](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/builder/src/registry-remote.ts#L12)

A configured remote registry (persisted by the host).

## Properties

### name

> **name**: `string`

Defined in: [builder/src/registry-remote.ts:13](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/builder/src/registry-remote.ts#L13)

***

### publicKey?

> `optional` **publicKey?**: `JsonWebKey`

Defined in: [builder/src/registry-remote.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/builder/src/registry-remote.ts#L16)

optional pinned publisher public key (JWK) — when set, the registry's signature is verified on every fetch

***

### url

> **url**: `string`

Defined in: [builder/src/registry-remote.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/builder/src/registry-remote.ts#L14)
