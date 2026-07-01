[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/env](../README.md) / encryptContent

# Function: encryptContent()

> **encryptContent**(`content`, `publicKey`, `opts?`): `Promise`\<`string`\>

Defined in: [envfile.ts:72](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/env/src/envfile.ts#L72)

Encrypt every plaintext value in the content to `publicKey`, leaving already-encrypted values + the key vars +
comments untouched, and ensuring the SULUK_PUBLIC_KEY line is present. Returns the new file content.
`only` restricts which keys get encrypted (default: all). `skipPlain` leaves listed keys as plaintext.

## Parameters

### content

`string`

### publicKey

`string`

### opts?

#### only?

`string`[]

#### skipPlain?

`string`[]

## Returns

`Promise`\<`string`\>
