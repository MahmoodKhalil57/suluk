# Functions

## downgrade

### `downgrade`
Project a v4 "Suluk" document to OpenAPI 3.1. Returns the 3.1 document plus diagnostics for everything
that could not be carried losslessly. Schema Objects are shared verbatim (identical dialect).
```ts
downgrade(doc: OpenAPIv4Document): DowngradeResult
```
**Parameters:**
- `doc: OpenAPIv4Document`
**Returns:** `DowngradeResult`

## upgrade

### `upgrade`
Project an OpenAPI 3.1 document up to the v4 "Suluk" model.
```ts
upgrade(doc31: Record<string, unknown>): OpenAPIv4Document
```
**Parameters:**
- `doc31: Record<string, unknown>`
**Returns:** `OpenAPIv4Document`

## validate31

### `validate31`
```ts
validate31(document: unknown): Validation31
```
**Parameters:**
- `document: unknown`
**Returns:** `Validation31`
