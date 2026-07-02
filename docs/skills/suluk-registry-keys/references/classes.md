# Classes

## keys.service

### `DisableKeys`
Disable keys in your apikey table (Better Auth's apikey plugin) — `revokeKeyTree` calls it. Provided from `auth`.
*extends `any`*
```ts
constructor(): DisableKeys
```

### `CreateKey`
MINT a real api key — provided from your auth layer (Better Auth's `auth.api.createApiKey`, which hashes + prefixes the
key). The `keys` module can't mint a valid Better-Auth key itself (that logic is the auth plugin's), so `provision`
injects this hook; the module owns only the HEADROOM CLAMP + the lineage record. Returns the new key id + the plaintext
key (shown once).
*extends `any`*
```ts
constructor(): CreateKey
```

### `Keys`
*extends `any`*
```ts
constructor(): Keys
```
