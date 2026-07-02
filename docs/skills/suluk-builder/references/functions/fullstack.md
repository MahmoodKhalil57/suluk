# Functions

## fullstack

### `crudRoutesFromSchema`
Generate backend CRUD RouteContracts from an entity's v4 schema (schemas → Zod for the bodies).
```ts
crudRoutesFromSchema(name: string, schema: SchemaOrRef, defs?: Record<string, SchemaOrRef>): RouteContract[]
```
**Parameters:**
- `name: string`
- `schema: SchemaOrRef`
- `defs: Record<string, SchemaOrRef>` (optional)
**Returns:** `RouteContract[]`

### `formBlock`
A Form block for an entity. Its contract (`params`) exposes only tone + which fields — the field SET is fixed.
```ts
formBlock(entity: Entity, defs?: Record<string, SchemaOrRef>): DslDocument
```
**Parameters:**
- `entity: Entity`
- `defs: Record<string, SchemaOrRef>` (optional)
**Returns:** `DslDocument`

### `tableBlock`
A Table block for an entity. Exposes tone + which columns.
```ts
tableBlock(entity: Entity, defs?: Record<string, SchemaOrRef>): DslDocument
```
**Parameters:**
- `entity: Entity`
- `defs: Record<string, SchemaOrRef>` (optional)
**Returns:** `DslDocument`

### `crudSection`
A CRUD section composing the entity's Table + Form blocks. It HARDCODES the block field/column details and
re-publishes only { tone, blocks } upward — so a page may reorder/hide the two blocks and set tone, but can
NOT reach into the form's fields. The narrowing is the section's contract.
```ts
crudSection(entity: Entity): DslDocument
```
**Parameters:**
- `entity: Entity`
**Returns:** `DslDocument`

### `appPage`
A page composing the given sections. Forwards tone; exposes only { sections, tone } upward.
```ts
appPage(name: string, sectionNames: string[]): DslDocument
```
**Parameters:**
- `name: string`
- `sectionNames: string[]`
**Returns:** `DslDocument`

### `buildApp`
Build the WHOLE app — backend (routes + v4) and frontend (components + pages) — from one declarative spec.
```ts
buildApp(spec: AppSpec): BuiltApp
```
**Parameters:**
- `spec: AppSpec`
**Returns:** `BuiltApp`
