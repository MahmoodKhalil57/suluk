[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / generateSigningKeypair

# Function: generateSigningKeypair()

> **generateSigningKeypair**(): `Promise`\<\{ `privateKey`: `JsonWebKey`; `publicKey`: `JsonWebKey`; \}\>

Defined in: [builder/src/signing.ts:62](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/builder/src/signing.ts#L62)

Generate an ECDSA P-256 keypair as JWKs (for tooling / tests — a publisher keeps the private key).

## Returns

`Promise`\<\{ `privateKey`: `JsonWebKey`; `publicKey`: `JsonWebKey`; \}\>
