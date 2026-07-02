[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / signRegistry

# Function: signRegistry()

> **signRegistry**(`value`, `privateKeyJwk`): `Promise`\<`string`\>

Defined in: [builder/src/signing.ts:71](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/builder/src/signing.ts#L71)

Sign a registry value with a private JWK → a base64 signature over its canonical bytes.

## Parameters

### value

`unknown`

### privateKeyJwk

`JsonWebKey`

## Returns

`Promise`\<`string`\>
