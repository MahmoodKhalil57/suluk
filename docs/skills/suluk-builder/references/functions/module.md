# Functions

## module

### `installModule`
Merge a module's contract fragment into the app document — REFUSING on any collision or unmet requirement.
On refusal `doc` is the unchanged `base` and `conflicts` explains why; nothing is partially applied.
```ts
installModule(base: OpenAPIv4Document, mod: SulukModule): InstallResult
```
**Parameters:**
- `base: OpenAPIv4Document`
- `mod: SulukModule`
**Returns:** `InstallResult`

### `namespaceModule`
Resolve a collision by NAMESPACING a module: prefix its OWNED entities, rewrite internal $refs that point to
them, and remap auto-CRUD cost keys accordingly. `requires` refs (e.g. User) are left untouched so the module
still composes with the host. The returned module installs cleanly alongside one that already owns the names.
```ts
namespaceModule(mod: SulukModule, prefix: string): SulukModule
```
**Parameters:**
- `mod: SulukModule`
- `prefix: string`
**Returns:** `SulukModule`

### `crudV4Paths`
The v4 CRUD operations for one entity, with $ref-based schemas (so the entity lives in components.schemas).
```ts
crudV4Paths(entity: string): Record<string, PathItem>
```
**Parameters:**
- `entity: string`
**Returns:** `Record<string, PathItem>`

### `moduleOperations`
Every operation handle a module declares (auto-CRUD per provided entity + explicit ops).
```ts
moduleOperations(mod: SulukModule): string[]
```
**Parameters:**
- `mod: SulukModule`
**Returns:** `string[]`

### `gradeModule`
A conformance grade. The real, author-attributable signal is COST coverage (auto-CRUD ops carry a
framework-injected summary, so @suluk/hono `coverage` is structurally ~1.0 and tells us nothing); we use it
only as a documentation-WARNING penalty on authored ops. A module that contributes nothing grades C.
```ts
gradeModule(mod: SulukModule): ModuleGrade
```
**Parameters:**
- `mod: SulukModule`
**Returns:** `ModuleGrade`

### `previewInstall`
Preview an install WITHOUT committing — what it adds, what it requires, any conflicts, and its grade.
```ts
previewInstall(base: OpenAPIv4Document, mod: SulukModule): InstallPreview
```
**Parameters:**
- `base: OpenAPIv4Document`
- `mod: SulukModule`
**Returns:** `InstallPreview`

### `schemaRefName`
The ROOT schema NAME a $ref targets, or null if it isn't a components/schemas reference. Parses the
JSON-Pointer by tokens (RFC 6901, matching @suluk/core's resolveRef) so a DEEP ref (.../Order/properties/id)
still resolves to its root "Order", and an escaped name (.../v2~1Order) unescapes to the real key "v2/Order"
— a flat /(.+)/ regex would mis-capture the whole tail and false-flag a legitimate ref as dangling.
```ts
schemaRefName(ref: string): string | null
```
**Parameters:**
- `ref: string`
**Returns:** `string | null`
