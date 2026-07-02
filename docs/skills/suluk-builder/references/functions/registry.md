# Functions

## registry

### `registry`
Build a registry from loose document lists + the set of leaf component names.
```ts
registry(opts: { components?: string[]; blocks?: DslDocument[]; sections?: DslDocument[]; pages?: DslDocument[] }): Registry
```
**Parameters:**
- `opts: { components?: string[]; blocks?: DslDocument[]; sections?: DslDocument[]; pages?: DslDocument[] }`
**Returns:** `Registry`

### `emptyRegistry`
```ts
emptyRegistry(): Registry
```
**Returns:** `Registry`

### `findDoc`
```ts
findDoc(r: Registry, type: string): DslDocument | undefined
```
**Parameters:**
- `r: Registry`
- `type: string`
**Returns:** `DslDocument | undefined`

### `allowedTypes`
The type names a document of `tier` is allowed to reference (its children come from COMPOSES[tier]).
```ts
allowedTypes(r: Registry, tier: Tier): Set<string>
```
**Parameters:**
- `r: Registry`
- `tier: Tier`
**Returns:** `Set<string>`
