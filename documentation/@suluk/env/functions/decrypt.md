[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/env](../README.md) / decrypt

# Function: decrypt()

> **decrypt**(`privateKey`, `token`): `Promise`\<`string`\>

Defined in: [crypto.ts:81](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/env/src/crypto.ts#L81)

Open an `encrypted:mlkem768:…` token with the private key. Throws if the key is wrong or the token is tampered.

## Parameters

### privateKey

`string`

### token

`string`

## Returns

`Promise`\<`string`\>
