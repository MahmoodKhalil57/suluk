# Configuration

## V4ToZodOptions

### Properties

#### defs

Resolver for `$ref`: a map of pointer → schema, or a function. Supports "#/$defs/X", "#/components/schemas/X".

**Type:** `Record<string, unknown> | ((ref: string) => unknown)`