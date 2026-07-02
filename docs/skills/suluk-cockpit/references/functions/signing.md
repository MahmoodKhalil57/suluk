# Functions

## signing

### `signRegistry`
Sign a registry value with a private JWK → a base64 signature over its canonical bytes.
```ts
signRegistry(value: unknown, privateKeyJwk: JsonWebKey): Promise<string>
```
**Parameters:**
- `value: unknown`
- `privateKeyJwk: JsonWebKey`
**Returns:** `Promise<string>`

### `verifyRegistrySignature`
Verify a registry value against a base64 signature + a pinned public JWK. Never throws — false on any error.
```ts
verifyRegistrySignature(value: unknown, signatureB64: string, publicKeyJwk: JsonWebKey): Promise<boolean>
```
**Parameters:**
- `value: unknown`
- `signatureB64: string`
- `publicKeyJwk: JsonWebKey`
**Returns:** `Promise<boolean>`

### `generateSigningKeypair`
Generate an ECDSA P-256 keypair as JWKs (for tooling / tests — a publisher keeps the private key).
```ts
generateSigningKeypair(): Promise<{ publicKey: JsonWebKey; privateKey: JsonWebKey }>
```
**Returns:** `Promise<{ publicKey: JsonWebKey; privateKey: JsonWebKey }>`

### `isSignedEnvelope`
```ts
isSignedEnvelope(v: unknown): v is SignedEnvelope
```
**Parameters:**
- `v: unknown`
**Returns:** `v is SignedEnvelope`
