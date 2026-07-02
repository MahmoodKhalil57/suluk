# Functions

## codegen

### `entityNames`
Entity names available for codegen (components.schemas).
```ts
entityNames(doc: OpenAPIv4Document): string[]
```
**Parameters:**
- `doc: OpenAPIv4Document`
**Returns:** `string[]`

### `generateForm`
Generate a shadcn form component (TSX) for an entity.
```ts
generateForm(doc: OpenAPIv4Document, name: string): string
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `name: string`
**Returns:** `string`

### `generateTable`
Generate a shadcn table component (TSX) for an entity.
```ts
generateTable(doc: OpenAPIv4Document, name: string): string
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `name: string`
**Returns:** `string`

### `generateStoresModule`
Generate the Nano Stores client wiring. @suluk/nano-stores is a runtime helper (createApiStores(routes)),
so the "codegen" is a thin, honest scaffold: it wires the user's RouteContracts to a typed store client and
lists, in comments, the exact stores the cockpit derived from the current document.
```ts
generateStoresModule(doc: OpenAPIv4Document, opts: { baseUrl?: string }): string
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `opts: { baseUrl?: string }` — default: `{}`
**Returns:** `string`

### `exportV4Json`
Export the v4 document as pretty JSON (the canonical interchange artifact).
```ts
exportV4Json(source: string): string
```
**Parameters:**
- `source: string`
**Returns:** `string`
