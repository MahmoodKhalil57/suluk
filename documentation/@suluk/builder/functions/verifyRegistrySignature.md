[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / verifyRegistrySignature

# Function: verifyRegistrySignature()

> **verifyRegistrySignature**(`value`, `signatureB64`, `publicKeyJwk`): `Promise`\<`boolean`\>

Defined in: [signing.ts:77](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/builder/src/signing.ts#L77)

Verify a registry value against a base64 signature + a pinned public JWK. Never throws — false on any error.

## Parameters

### value

`unknown`

### signatureB64

`string`

### publicKeyJwk

`JsonWebKey`

## Returns

`Promise`\<`boolean`\>
