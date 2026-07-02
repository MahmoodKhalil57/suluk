# Functions

## registry-remote

### `parseRegistry`
Parse an UNTRUSTED registry payload (e.g. fetched JSON) into a ModuleRegistry, rejecting malformed entries.
```ts
parseRegistry(json: unknown): ParsedRegistry
```
**Parameters:**
- `json: unknown`
**Returns:** `ParsedRegistry`

### `validateModule`
Validate one UNTRUSTED module manifest, VALUE-shapes included. Returns the typed module or a human reason.
```ts
validateModule(m: unknown): { module?: SulukModule; error?: string }
```
**Parameters:**
- `m: unknown`
**Returns:** `{ module?: SulukModule; error?: string }`
