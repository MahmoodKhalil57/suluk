[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/env](../README.md) / decrypt

# Function: decrypt()

> **decrypt**(`privateKey`, `token`): `Promise`\<`string`\>

Defined in: [crypto.ts:81](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/env/src/crypto.ts#L81)

Open an `encrypted:mlkem768:…` token with the private key. Throws if the key is wrong or the token is tampered.

## Parameters

### privateKey

`string`

### token

`string`

## Returns

`Promise`\<`string`\>
