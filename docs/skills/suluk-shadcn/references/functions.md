# Functions

## spec

### `formSpec`
Build a FormSpec from an object Schema Object. Each property becomes one FieldSpec.
A non-object root (array/scalar/boolean/unresolved-ref) yields zero fields plus a warning — honest, not silent.
```ts
formSpec(schema: SchemaOrRef, opts: SpecOptions): FormSpec
```
**Parameters:**
- `schema: SchemaOrRef`
- `opts: SpecOptions` — default: `{}`
**Returns:** `FormSpec`

### `tableSpec`
Build a TableSpec. An array root uses its `items` object; an object root uses its own properties.
Each property becomes one ColumnSpec. Non-derivable roots yield zero columns plus a warning.
```ts
tableSpec(schema: SchemaOrRef, opts: SpecOptions): TableSpec
```
**Parameters:**
- `schema: SchemaOrRef`
- `opts: SpecOptions` — default: `{}`
**Returns:** `TableSpec`

## render-form

### `renderFormTsx`
Render a shadcn <Form> component from a FormSpec. Returns TSX source as a string.
```ts
renderFormTsx(spec: FormSpec, opts: RenderFormOptions): string
```
**Parameters:**
- `spec: FormSpec`
- `opts: RenderFormOptions` — default: `{}`
**Returns:** `string`

## render-table

### `renderTableTsx`
Render a shadcn <Table> component from a TableSpec. Returns TSX source as a string.
```ts
renderTableTsx(spec: TableSpec, opts: RenderTableOptions): string
```
**Parameters:**
- `spec: TableSpec`
- `opts: RenderTableOptions` — default: `{}`
**Returns:** `string`

## render-detail

### `renderDetailTsx`
Render a read-only shadcn detail (show) view from a FormSpec. Returns TSX source as a string.
```ts
renderDetailTsx(spec: FormSpec, opts: RenderDetailOptions): string
```
**Parameters:**
- `spec: FormSpec`
- `opts: RenderDetailOptions` — default: `{}`
**Returns:** `string`

## render-skeleton

### `renderFormSkeletonTsx`
A form skeleton — one label+control placeholder per field, plus a submit-button placeholder.
```ts
renderFormSkeletonTsx(spec: FormSpec, opts: RenderSkeletonOptions): string
```
**Parameters:**
- `spec: FormSpec`
- `opts: RenderSkeletonOptions` — default: `{}`
**Returns:** `string`

### `renderTableSkeletonTsx`
A table skeleton — a header row of column placeholders + N body rows of cell placeholders.
```ts
renderTableSkeletonTsx(spec: TableSpec, opts: RenderSkeletonOptions): string
```
**Parameters:**
- `spec: TableSpec`
- `opts: RenderSkeletonOptions` — default: `{}`
**Returns:** `string`

### `renderDetailSkeletonTsx`
A detail skeleton — one label+value placeholder row per field.
```ts
renderDetailSkeletonTsx(spec: FormSpec, opts: RenderSkeletonOptions): string
```
**Parameters:**
- `spec: FormSpec`
- `opts: RenderSkeletonOptions` — default: `{}`
**Returns:** `string`

## theme

### `renderShadcnTheme`
The full shadcn theme file set from a TokenSpec/ThemeSpec: the css path → globals.css + components.json.
```ts
renderShadcnTheme(theme: TokenSpec | ThemeSpec, opts: ShadcnThemeOptions): Record<string, string>
```
**Parameters:**
- `theme: TokenSpec | ThemeSpec`
- `opts: ShadcnThemeOptions` — default: `{}`
**Returns:** `Record<string, string>`

### `renderGlobalsCss`
The shadcn `globals.css`: the Tailwind import + the `dark` custom-variant + the token vars (light at `:root`,
dark at the dark selector) + the `@theme inline` mapping + a base layer applying border/bg/text tokens.
```ts
renderGlobalsCss(theme: TokenSpec | ThemeSpec, opts: ShadcnThemeOptions): string
```
**Parameters:**
- `theme: TokenSpec | ThemeSpec`
- `opts: ShadcnThemeOptions` — default: `{}`
**Returns:** `string`

### `renderComponentsJson`
The shadcn `components.json` CLI config — `cssVariables: true`, so the generated tokens drive the components.
```ts
renderComponentsJson(opts: ShadcnThemeOptions): string
```
**Parameters:**
- `opts: ShadcnThemeOptions` — default: `{}`
**Returns:** `string`
