[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / generateSigningKeypair

# Function: generateSigningKeypair()

> **generateSigningKeypair**(): `Promise`\<\{ `privateKey`: `JsonWebKey`; `publicKey`: `JsonWebKey`; \}\>

Defined in: [signing.ts:62](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/builder/src/signing.ts#L62)

Generate an ECDSA P-256 keypair as JWKs (for tooling / tests — a publisher keeps the private key).

## Returns

`Promise`\<\{ `privateKey`: `JsonWebKey`; `publicKey`: `JsonWebKey`; \}\>
