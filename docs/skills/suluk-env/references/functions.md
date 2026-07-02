# Functions

## crypto

### `keygen`
Generate an ML-KEM-768 keypair. Pass a 64-byte seed only for deterministic/test keygen.
```ts
keygen(seed?: Uint8Array<ArrayBufferLike>): Keypair
```
**Parameters:**
- `seed: Uint8Array<ArrayBufferLike>` (optional)
**Returns:** `Keypair`

### `encrypt`
Seal a plaintext value to a public key → an `encrypted:mlkem768:…` token.
```ts
encrypt(publicKey: string, plaintext: string): Promise<string>
```
**Parameters:**
- `publicKey: string`
- `plaintext: string`
**Returns:** `Promise<string>`

### `decrypt`
Open an `encrypted:mlkem768:…` token with the private key. Throws if the key is wrong or the token is tampered.
```ts
decrypt(privateKey: string, token: string): Promise<string>
```
**Parameters:**
- `privateKey: string`
- `token: string`
**Returns:** `Promise<string>`

### `isEncrypted`
Is this value an `encrypted:…` token (vs plaintext)?
```ts
isEncrypted(value: string): boolean
```
**Parameters:**
- `value: string`
**Returns:** `boolean`

### `publicFromPrivate`
Derive the public key string from a private key (so `set`/`encrypt` work given only the secret).
```ts
publicFromPrivate(privateKey: string): string
```
**Parameters:**
- `privateKey: string`
**Returns:** `string`

## envfile

### `parseEnv`
Parse .env content → an ordered { key, value } record (raw values; encrypted ones stay as tokens).
```ts
parseEnv(content: string): Record<string, string>
```
**Parameters:**
- `content: string`
**Returns:** `Record<string, string>`

### `resolveEnv`
Resolve .env content to a plain { KEY: value } record with every encrypted value DECRYPTED. The runtime
primitive: a Worker calls this with the committed .env text + the private key from a secret binding; a CLI
calls it with the file + .env.keys. The key vars (SULUK_PUBLIC_KEY/PRIVATE_KEY) are never emitted.
```ts
resolveEnv(content: string, privateKey?: string): Promise<Record<string, string>>
```
**Parameters:**
- `content: string`
- `privateKey: string` (optional)
**Returns:** `Promise<Record<string, string>>`

### `encryptContent`
Encrypt every plaintext value in the content to `publicKey`, leaving already-encrypted values + the key vars +
comments untouched, and ensuring the SULUK_PUBLIC_KEY line is present. Returns the new file content.
`only` restricts which keys get encrypted (default: all). `skipPlain` leaves listed keys as plaintext.
```ts
encryptContent(content: string, publicKey: string, opts: { only?: string[]; skipPlain?: string[] }): Promise<string>
```
**Parameters:**
- `content: string`
- `publicKey: string`
- `opts: { only?: string[]; skipPlain?: string[] }` — default: `{}`
**Returns:** `Promise<string>`

### `decryptContent`
Decrypt every encrypted value in the content with `privateKey` → plaintext file content (for inspection).
```ts
decryptContent(content: string, privateKey: string): Promise<string>
```
**Parameters:**
- `content: string`
- `privateKey: string`
**Returns:** `Promise<string>`

## load

### `loadEnv`
Resolve + inject. Returns the decrypted { KEY: value } record that was loaded.
```ts
loadEnv(opts: LoadOptions): Promise<Record<string, string>>
```
**Parameters:**
- `opts: LoadOptions`
**Returns:** `Promise<Record<string, string>>`

## schema

### `defineEnv`
```ts
defineEnv<S>(spec: S): DefinedEnv<S>
```
**Parameters:**
- `spec: S`
**Returns:** `DefinedEnv<S>`
