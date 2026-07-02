[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / generateSigningKeypair

# Function: generateSigningKeypair()

> **generateSigningKeypair**(): `Promise`\<\{ `privateKey`: `JsonWebKey`; `publicKey`: `JsonWebKey`; \}\>

Defined in: [signing.ts:62](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/builder/src/signing.ts#L62)

Generate an ECDSA P-256 keypair as JWKs (for tooling / tests — a publisher keeps the private key).

## Returns

`Promise`\<\{ `privateKey`: `JsonWebKey`; `publicKey`: `JsonWebKey`; \}\>
