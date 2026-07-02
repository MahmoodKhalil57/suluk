# Functions

## builder

### `buildBuilderModel`
Build the full builder model from a v4 document (its schemas → entities → buildApp).
```ts
buildBuilderModel(doc: OpenAPIv4Document): BuilderModel
```
**Parameters:**
- `doc: OpenAPIv4Document`
**Returns:** `BuilderModel`

### `builderTree`
The full tier tree (pages → sections → blocks → components) with each tier's contract.
```ts
builderTree(app: BuiltApp): BuilderNode[]
```
**Parameters:**
- `app: BuiltApp`
**Returns:** `BuilderNode[]`

### `entitiesFromDoc`
Each components.schemas entry becomes a builder entity.
```ts
entitiesFromDoc(doc: OpenAPIv4Document): Entity[]
```
**Parameters:**
- `doc: OpenAPIv4Document`
**Returns:** `Entity[]`

### `generateAppFiles`
All files for the generated app: the v4 doc, the frontend components + pages, and the shadcn registry.
```ts
generateAppFiles(doc: OpenAPIv4Document): GeneratedFile[]
```
**Parameters:**
- `doc: OpenAPIv4Document`
**Returns:** `GeneratedFile[]`

### `generateRegistryJson`
The shadcn registry (index + items) as a pretty JSON string — the "Export shadcn registry" action.
```ts
generateRegistryJson(doc: OpenAPIv4Document): string
```
**Parameters:**
- `doc: OpenAPIv4Document`
**Returns:** `string`
