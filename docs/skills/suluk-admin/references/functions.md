# Functions

## app

### `adminApp`
Build the /superadmin Hono app. Mount it on your server: `app.route("/", adminApp({...}))`.
```ts
adminApp(opts: AdminOptions): Hono
```
**Parameters:**
- `opts: AdminOptions`
**Returns:** `Hono`

## render

### `layout`
```ts
layout(title: string, base: string, active: string, body: string, headHtml: string): string
```
**Parameters:**
- `title: string`
- `base: string`
- `active: string`
- `body: string`
- `headHtml: string` — default: `""`
**Returns:** `string`

### `renderCycle`
```ts
renderCycle(model: CycleModel): string
```
**Parameters:**
- `model: CycleModel`
**Returns:** `string`

### `renderBuilder`
```ts
renderBuilder(tree: BuilderNode[]): string
```
**Parameters:**
- `tree: BuilderNode[]`
**Returns:** `string`

### `renderChecks`
```ts
renderChecks(checks: DocCheck[]): string
```
**Parameters:**
- `checks: DocCheck[]`
**Returns:** `string`

### `renderDeploy`
```ts
renderDeploy(plan: DeployPlan): string
```
**Parameters:**
- `plan: DeployPlan`
**Returns:** `string`

### `esc`
```ts
esc(s: unknown): string
```
**Parameters:**
- `s: unknown`
**Returns:** `string`

## render-data

### `entityModels`
Project a v4 document's component schemas into admin entity models (fields + per-CRUD access scope), sorted.
```ts
entityModels(doc: OpenAPIv4Document): EntityModel[]
```
**Parameters:**
- `doc: OpenAPIv4Document`
**Returns:** `EntityModel[]`

### `renderEntityForm`
A create/edit form for an entity, derived from its schema. `id` is omitted on create (DB-assigned).
```ts
renderEntityForm(entity: EntityModel, mode: "create" | "edit", action: string): string
```
**Parameters:**
- `entity: EntityModel`
- `mode: "create" | "edit"`
- `action: string`
**Returns:** `string`

### `renderEntityTable`
A list table for an entity — a column per field; `rows` are optional sample data to fill it.
```ts
renderEntityTable(entity: EntityModel, rows: Record<string, unknown>[]): string
```
**Parameters:**
- `entity: EntityModel`
- `rows: Record<string, unknown>[]` — default: `[]`
**Returns:** `string`

### `renderDataIndex`
The data-admin index: every CRUD-managed entity + its access scopes, linking to its per-entity page.
```ts
renderDataIndex(doc: OpenAPIv4Document, base: string): string
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `base: string`
**Returns:** `string`

### `renderEntityAdmin`
One entity's data-admin page — a FULLY FUNCTIONAL CRUD UI (saastarter's Payload admin, projected): a live list
table (loaded from the entity's CRUD endpoint), a create/edit form, and per-row Edit + Delete — all driven by
inline vanilla JS hitting the same admin-gated CRUD routes the contract already serves, so the admin can never
drift from the schema AND actually writes. `id`/server-managed fields are read-only on create.
```ts
renderEntityAdmin(doc: OpenAPIv4Document, name: string, base: string, _rows: Record<string, unknown>[]): string
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `name: string`
- `base: string`
- `_rows: Record<string, unknown>[]` — default: `[]`
**Returns:** `string`

## analytics

### `renderAnalytics`
Render the analytics dashboard for a document.
```ts
renderAnalytics(doc: OpenAPIv4Document): string
```
**Parameters:**
- `doc: OpenAPIv4Document`
**Returns:** `string`
