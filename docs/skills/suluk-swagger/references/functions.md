# Functions

## `swaggerHtml`
Render a v4 document to a self-contained Swagger UI HTML page (+ downgrade diagnostics).
```ts
swaggerHtml(doc: OpenAPIv4Document, opts: SwaggerOptions): RenderResult
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `opts: SwaggerOptions` — default: `{}`
**Returns:** `RenderResult`

## `swaggerResponse`
Convenience for Bun.serve / Hono / fetch handlers: the Swagger UI page as a text/html Response.
```ts
swaggerResponse(doc: OpenAPIv4Document, opts: SwaggerOptions): Response
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `opts: SwaggerOptions` — default: `{}`
**Returns:** `Response`
