[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / signRegistry

# Function: signRegistry()

> **signRegistry**(`value`, `privateKeyJwk`): `Promise`\<`string`\>

Defined in: [signing.ts:71](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/builder/src/signing.ts#L71)

Sign a registry value with a private JWK → a base64 signature over its canonical bytes.

## Parameters

### value

`unknown`

### privateKeyJwk

`JsonWebKey`

## Returns

`Promise`\<`string`\>
