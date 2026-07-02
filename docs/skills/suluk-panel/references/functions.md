# Functions

## fields

### `fieldsOf`
Infer the ordered field set for an entity. `entities` is the set of entity names (for relationship detection).
```ts
fieldsOf(schema: Schema, entities: Set<string>, opts: FieldsOptions): Field[]
```
**Parameters:**
- `schema: Schema`
- `entities: Set<string>` — default: `...`
- `opts: FieldsOptions` — default: `{}`
**Returns:** `Field[]`

### `titleField`
The entity's best "title" field — for list columns + relationship option labels.
```ts
titleField(fields: Field[]): string
```
**Parameters:**
- `fields: Field[]`
**Returns:** `string`

### `humanize`
"coverImageUrl" → "Cover Image", "categoryId" → "Category".
```ts
humanize(name: string): string
```
**Parameters:**
- `name: string`
**Returns:** `string`

## model

### `entityModels`
```ts
entityModels(doc: Doc, opts: FieldsOptions): EntityModel[]
```
**Parameters:**
- `doc: Doc`
- `opts: FieldsOptions` — default: `{}`
**Returns:** `EntityModel[]`

## widgets

### `renderInput`
```ts
renderInput(f: Field, value: unknown): string
```
**Parameters:**
- `f: Field`
- `value: unknown` — default: `""`
**Returns:** `string`

### `renderFieldRow`
One labelled field row (label · required mark · description · the input).
```ts
renderFieldRow(f: Field, value: unknown): string
```
**Parameters:**
- `f: Field`
- `value: unknown` — default: `""`
**Returns:** `string`

## list

### `renderList`
```ts
renderList(model: EntityModel, opts: ListOptions): string
```
**Parameters:**
- `model: EntityModel`
- `opts: ListOptions`
**Returns:** `string`

## form

### `renderForm`
```ts
renderForm(model: EntityModel, opts: FormOptions): string
```
**Parameters:**
- `model: EntityModel`
- `opts: FormOptions`
**Returns:** `string`

## shell

### `renderShell`
```ts
renderShell(o: ShellOptions): string
```
**Parameters:**
- `o: ShellOptions`
**Returns:** `string`

## richtext

### `richtextEditor`
The editor markup for one rich-text field. `name` is the form field; `value` is the initial markdown.
```ts
richtextEditor(name: string, value: unknown, attrs: string): string
```
**Parameters:**
- `name: string`
- `value: unknown` — default: `""`
- `attrs: string` — default: `""`
**Returns:** `string`

### `richtextScript`
Client init for every `[data-rt]` on the page — toolbar inserts markdown around the selection; the Preview tab
 renders the markdown with an inline, escape-first (XSS-safe) renderer. Include once per page that has editors.
```ts
richtextScript(): string
```
**Returns:** `string`

## media

### `mediaEditor`
```ts
mediaEditor(name: string, value: unknown, attrs: string): string
```
**Parameters:**
- `name: string`
- `value: unknown` — default: `""`
- `attrs: string` — default: `""`
**Returns:** `string`

### `mediaScript`
Client init for every `[data-media]`: live preview on URL change + (if window.__pfUpload is set) upload on file
 pick. Without an endpoint the Upload button hides and it's URL-only. Include once per page that has media fields.
```ts
mediaScript(): string
```
**Returns:** `string`

## app

### `panelApp`
```ts
panelApp(opts: PanelOptions): Hono
```
**Parameters:**
- `opts: PanelOptions`
**Returns:** `Hono`
