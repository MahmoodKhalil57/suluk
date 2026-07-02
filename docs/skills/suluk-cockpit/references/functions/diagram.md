# Functions

## diagram

### `contractToD2`
Generate D2 diagram source for a view of the contract.
```ts
contractToD2(doc: OpenAPIv4Document, view: DiagramView): string
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `view: DiagramView`
**Returns:** `string`

### `diagramViews`
```ts
diagramViews(): { id: DiagramView; title: string; description: string }[]
```
**Returns:** `{ id: DiagramView; title: string; description: string }[]`
