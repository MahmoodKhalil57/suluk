# Variables & Constants

## baseline

### `contentHash`
Hash of the render-affecting source of a primitive (its component code, variant, tokens).
```ts
const contentHash: (input: string | Uint8Array<ArrayBufferLike>) => string
```

### `snapshotHash`
Hash of an approved screenshot's bytes — the recorded identity of "what was verified".
```ts
const snapshotHash: (input: string | Uint8Array<ArrayBufferLike>) => string
```
