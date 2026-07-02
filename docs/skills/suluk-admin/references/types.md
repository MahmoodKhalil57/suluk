# Types & Enums

## render-data

### `EntityModel`
**Properties:**
- `name: string`
- `fields: EntityField[]`
- `access: EntityAccess` — the `requires` level of each CRUD op (from x-suluk-access), so the admin shows who may do what.

### `EntityField`
**Properties:**
- `name: string`
- `type: string` — JSON-Schema type: string | integer | number | boolean | array | object.
- `required: boolean`
- `format: string` (optional)
- `enum: string[]` (optional)

### `EntityAccess`
**Properties:**
- `list: string` (optional)
- `get: string` (optional)
- `create: string` (optional)
- `update: string` (optional)
- `delete: string` (optional)
