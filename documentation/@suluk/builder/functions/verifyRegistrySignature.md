[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / verifyRegistrySignature

# Function: verifyRegistrySignature()

> **verifyRegistrySignature**(`value`, `signatureB64`, `publicKeyJwk`): `Promise`\<`boolean`\>

Defined in: [signing.ts:77](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/builder/src/signing.ts#L77)

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
