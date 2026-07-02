# Functions

## `editorHtml`
Build the self-contained editor page.
```ts
editorHtml(opts: EditorOptions): string
```
**Parameters:**
- `opts: EditorOptions` — default: `{}`
**Returns:** `string`

## `editorResponse`
The editor page as a text/html Response (Workers / Bun.serve / Hono).
```ts
editorResponse(opts: EditorOptions): Response
```
**Parameters:**
- `opts: EditorOptions` — default: `{}`
**Returns:** `Response`
