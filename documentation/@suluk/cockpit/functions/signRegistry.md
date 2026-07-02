[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / signRegistry

# Function: signRegistry()

> **signRegistry**(`value`, `privateKeyJwk`): `Promise`\<`string`\>

Defined in: [builder/src/signing.ts:71](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/builder/src/signing.ts#L71)

Sign a registry value with a private JWK → a base64 signature over its canonical bytes.

## Parameters

### value

`unknown`

### privateKeyJwk

`JsonWebKey`

## Returns

`Promise`\<`string`\>
