[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / generateSigningKeypair

# Function: generateSigningKeypair()

> **generateSigningKeypair**(): `Promise`\<\{ `privateKey`: `JsonWebKey`; `publicKey`: `JsonWebKey`; \}\>

Defined in: [signing.ts:62](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/builder/src/signing.ts#L62)

Generate an ECDSA P-256 keypair as JWKs (for tooling / tests — a publisher keeps the private key).

## Returns

`Promise`\<\{ `privateKey`: `JsonWebKey`; `publicKey`: `JsonWebKey`; \}\>
