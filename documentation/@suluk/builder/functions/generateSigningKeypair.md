[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / generateSigningKeypair

# Function: generateSigningKeypair()

> **generateSigningKeypair**(): `Promise`\<\{ `privateKey`: `JsonWebKey`; `publicKey`: `JsonWebKey`; \}\>

Defined in: [signing.ts:62](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/builder/src/signing.ts#L62)

Generate an ECDSA P-256 keypair as JWKs (for tooling / tests — a publisher keeps the private key).

## Returns

`Promise`\<\{ `privateKey`: `JsonWebKey`; `publicKey`: `JsonWebKey`; \}\>
