[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/env](../README.md) / decrypt

# Function: decrypt()

> **decrypt**(`privateKey`, `token`): `Promise`\<`string`\>

Defined in: [crypto.ts:81](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/env/src/crypto.ts#L81)

Open an `encrypted:mlkem768:…` token with the private key. Throws if the key is wrong or the token is tampered.

## Parameters

### privateKey

`string`

### token

`string`

## Returns

`Promise`\<`string`\>
