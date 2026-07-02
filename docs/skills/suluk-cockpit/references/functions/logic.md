# Functions

## logic

### `validateSource`
Parse + meta-schema validate a document source. Parse failure → a single error diagnostic.
```ts
validateSource(text: string): { ok: boolean; diagnostics: Diagnostic[] }
```
**Parameters:**
- `text: string`
**Returns:** `{ ok: boolean; diagnostics: Diagnostic[] }`

### `auditSource`
Documentation-coverage audit (under-documented routes) via the @suluk/hono engine.
```ts
auditSource(text: string): { findings: Finding[]; diagnostics: Diagnostic[] }
```
**Parameters:**
- `text: string`
**Returns:** `{ findings: Finding[]; diagnostics: Diagnostic[] }`

### `previewHtml`
Build a self-contained preview page (Scalar or Swagger) for a v4 source. Returns html + downgrade diagnostics.
```ts
previewHtml(text: string, ui: "scalar" | "swagger"): { html: string; diagnostics: { message: string }[] }
```
**Parameters:**
- `text: string`
- `ui: "scalar" | "swagger"`
**Returns:** `{ html: string; diagnostics: { message: string }[] }`

### `looksLikeV4`
True if a parsed document looks like a v4 "Suluk" document (so we only act on those).
```ts
looksLikeV4(doc: unknown): doc is OpenAPIv4Document
```
**Parameters:**
- `doc: unknown`
**Returns:** `doc is OpenAPIv4Document`
