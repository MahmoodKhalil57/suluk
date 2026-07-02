# Types & Enums

## spec

### `FieldWidget`
The shadcn form control we pick for a property. Drives which control the renderer emits.
```ts
"text" | "number" | "checkbox" | "switch" | "select" | "textarea" | "date" | "email" | "url" | "datetime" | "file" | "richtext" | "relation"
```

### `FieldSpec`
One form control, derived from a single object property.
**Properties:**
- `name: string` — Property name = react-hook-form field name.
- `label: string` — Human label (title if present, else the humanised name).
- `widget: FieldWidget` — Which shadcn control to render.
- `required: boolean` — Whether the property is in the object's `required[]`.
- `description: string` (optional) — Schema `description`, if any (rendered as helper text).
- `options: string[]` (optional) — Allowed values for a `select` (the enum members, stringified).
- `min: number` (optional) — Numeric bounds (minimum/maximum) — surfaced on number/date inputs.
- `max: number` (optional)
- `pattern: string` (optional) — String `pattern` (regex source) — surfaced as a hint.
- `relation: string` (optional) — For a `relation` widget: the entity this property references (from `x-suluk-relation`).

### `FormSpec`
`@suluk/shadcn` — the UI corner. v4 "Suluk" Schema Objects → shadcn/ui form + table specs and TSX scaffolds.

The chain is: Zod → v4 Schema Object (@suluk/zod) → descriptor model (formSpec/tableSpec, here) → shadcn TSX
(renderFormTsx/renderTableTsx, here). This package is CODEGEN ONLY — no runtime UI deps; it emits component
source as strings against the conventional shadcn/ui import paths (react-hook-form + zodResolver for forms).

Honest-loss discipline (house pattern): the descriptor specs carry a `warnings: string[]` channel for every
property we could not faithfully map (unresolvable $ref, boolean schemas, non-object roots), and the
renderers surface those warnings as a leading comment block. Nothing is dropped silently. CANDIDATE tooling.
**Properties:**
- `fields: FieldSpec[]`
- `warnings: string[]` — Properties we could not faithfully map (enumerated; never dropped silently).

### `ColumnSpec`
One table column, derived from a single object property.
**Properties:**
- `key: string` — Property name = row accessor key.
- `header: string` — Column header (title if present, else the humanised key).
- `type: string` — The JSON Schema `type` of the property ("string"/"number"/… or "unknown").

### `TableSpec`
`@suluk/shadcn` — the UI corner. v4 "Suluk" Schema Objects → shadcn/ui form + table specs and TSX scaffolds.

The chain is: Zod → v4 Schema Object (@suluk/zod) → descriptor model (formSpec/tableSpec, here) → shadcn TSX
(renderFormTsx/renderTableTsx, here). This package is CODEGEN ONLY — no runtime UI deps; it emits component
source as strings against the conventional shadcn/ui import paths (react-hook-form + zodResolver for forms).

Honest-loss discipline (house pattern): the descriptor specs carry a `warnings: string[]` channel for every
property we could not faithfully map (unresolvable $ref, boolean schemas, non-object roots), and the
renderers surface those warnings as a leading comment block. Nothing is dropped silently. CANDIDATE tooling.
**Properties:**
- `columns: ColumnSpec[]`
- `warnings: string[]`
