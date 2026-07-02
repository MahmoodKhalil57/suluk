[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / RegistrySource

# Interface: RegistrySource

Defined in: [registry-remote.ts:12](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/builder/src/registry-remote.ts#L12)

A configured remote registry (persisted by the host).

## Properties

### name

> **name**: `string`

Defined in: [registry-remote.ts:13](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/builder/src/registry-remote.ts#L13)

***

### publicKey?

> `optional` **publicKey?**: `JsonWebKey`

Defined in: [registry-remote.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/builder/src/registry-remote.ts#L16)

optional pinned publisher public key (JWK) — when set, the registry's signature is verified on every fetch

***

### url

> **url**: `string`

Defined in: [registry-remote.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/builder/src/registry-remote.ts#L14)
