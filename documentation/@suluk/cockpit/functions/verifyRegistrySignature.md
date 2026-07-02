[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / verifyRegistrySignature

# Function: verifyRegistrySignature()

> **verifyRegistrySignature**(`value`, `signatureB64`, `publicKeyJwk`): `Promise`\<`boolean`\>

Defined in: [builder/src/signing.ts:77](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/builder/src/signing.ts#L77)

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
