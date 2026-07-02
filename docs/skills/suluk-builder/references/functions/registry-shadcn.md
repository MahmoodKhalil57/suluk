# Functions

## registry-shadcn

### `toShadcnRegistry`
Convert a BuiltApp into a shadcn registry: one "block" item per entity bundling its frontend components +
backend routes module + its v4 schema, plus one "page" item per generated page.
```ts
toShadcnRegistry(app: BuiltApp, opts: { name?: string; homepage?: string }): ShadcnRegistry
```
**Parameters:**
- `app: BuiltApp`
- `opts: { name?: string; homepage?: string }` — default: `{}`
**Returns:** `ShadcnRegistry`
