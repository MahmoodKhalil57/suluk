[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / signRegistry

# Function: signRegistry()

> **signRegistry**(`value`, `privateKeyJwk`): `Promise`\<`string`\>

Defined in: [builder/src/signing.ts:71](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/builder/src/signing.ts#L71)

Sign a registry value with a private JWK → a base64 signature over its canonical bytes.

## Parameters

### value

`unknown`

### privateKeyJwk

`JsonWebKey`

## Returns

`Promise`\<`string`\>
