[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / verifyRegistrySignature

# Function: verifyRegistrySignature()

> **verifyRegistrySignature**(`value`, `signatureB64`, `publicKeyJwk`): `Promise`\<`boolean`\>

Defined in: [signing.ts:77](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/builder/src/signing.ts#L77)

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
