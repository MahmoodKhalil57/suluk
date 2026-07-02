# Functions

## validate

### `validateDocument`
Validate one document against the registry.
```ts
validateDocument(doc: DslDocument, reg: Registry): DslError[]
```
**Parameters:**
- `doc: DslDocument`
- `reg: Registry`
**Returns:** `DslError[]`

### `validateAll`
Validate every page / section / block in the registry.
```ts
validateAll(reg: Registry): DslError[]
```
**Parameters:**
- `reg: Registry`
**Returns:** `DslError[]`
