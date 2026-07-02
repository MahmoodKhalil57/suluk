# Functions

## render

### `renderPageTsx`
```ts
renderPageTsx(page: DslDocument, reg: Registry, opts: { baseUrl?: string }): string
```
**Parameters:**
- `page: DslDocument`
- `reg: Registry`
- `opts: { baseUrl?: string }` — default: `{}`
**Returns:** `string`

### `resolveComponents`
Ordered component names a page resolves to (section list → each section's block list → block===component).
```ts
resolveComponents(page: DslDocument, reg: Registry): string[]
```
**Parameters:**
- `page: DslDocument`
- `reg: Registry`
**Returns:** `string[]`
