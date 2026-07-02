# Functions

## to-v4

### `zodToV4`
Convert a Zod schema to a v4 Schema Object. `io` picks the input vs output projection for schemas with
defaults/transforms ("output" is the default — the shape after parsing).
```ts
zodToV4(schema: ZodType, opts: { io?: "input" | "output" }): ZodToV4Result
```
**Parameters:**
- `schema: ZodType`
- `opts: { io?: "input" | "output" }` — default: `{}`
**Returns:** `ZodToV4Result`

## to-zod

### `v4ToZod`
Convert a v4 Schema Object to a Zod schema.
```ts
v4ToZod(schema: JSchema, opts: V4ToZodOptions): ZodType
```
**Parameters:**
- `schema: JSchema`
- `opts: V4ToZodOptions` — default: `{}`
**Returns:** `ZodType`

### `convert`
Core recursive conversion of one v4/JSON-Schema node to a Zod type.
```ts
convert(node: JSchema, opts: V4ToZodOptions): ZodType
```
**Parameters:**
- `node: JSchema`
- `opts: V4ToZodOptions` — default: `{}`
**Returns:** `ZodType`
