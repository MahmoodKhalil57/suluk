# Functions

## contract.contract

### `apiDocument`
Build the v4 OpenAPI document, projected for a principal (the WHO axis). Pass the caller's `{ scopes }` to hide any
operation whose required scopes they don't hold; omit it for the full public-plus-scoped document (the SDK / docs /
conformance project everything). The document is a PURE FUNCTION of the contract × the principal — @suluk/hono's
`emitV4` does the derivation (it also synthesizes the RFC-9457 error responses + the 401/403 for scoped ops).
```ts
apiDocument(principal?: { scopes: string[] }): OpenAPIv4Document
```
**Parameters:**
- `principal: { scopes: string[] }` (optional)
**Returns:** `OpenAPIv4Document`

### `apiDocumentWithAuth`
The FULL v4 document INCLUDING Better Auth's own surface (sign-in/up/out, get-session, social sign-in, …) — so
BETTER-AUTH CLIENTS can discover + call the auth API from the same `/api/openapi.json`, exactly like toolfactory does.
It ingests the `openAPI()`-generated OAS 3.0 (`auth.api.generateOpenAPISchema()`) → v4 (@suluk/better-auth's
`ingestAuthOpenAPI`) → merges it into apiDocument (`mergeAuth`). ASYNC: the auth schema comes from a LIVE,
per-request auth instance (Workers build it via `createAuth(c.env)`). Best-effort — if the generator is absent or throws
it falls back to the base doc (never throws), so `/api/openapi.json` always serves at least the app surface. The APP wins
a path collision (a barebones auth op never clobbers a typed contract op); Better Auth only emits enabled routes.
```ts
apiDocumentWithAuth(authApi: unknown, principal?: { scopes: string[] }): Promise<OpenAPIv4Document>
```
**Parameters:**
- `authApi: unknown`
- `principal: { scopes: string[] }` (optional)
**Returns:** `Promise<OpenAPIv4Document>`

### `matchRoute`
TIER-1 route match — the exact declared op a request resolves to: the longest static-path-prefix + same-method match
among the CONTRACT (a `GET /api/credits/balance/x` → the `getCredits` op at `/api/credits`). The single matcher both
`scopeForRequest` (the scope gate) and `validateRequest` (the body gate) read, so they can never disagree on WHICH op
a wire request maps to. Returns the whole RouteContract (name + scopes + request), or `undefined` if none match.
```ts
matchRoute(method: string, path: string): any
```
**Parameters:**
- `method: string`
- `path: string`
**Returns:** `any`

### `scopeForRequest`
```ts
scopeForRequest(method: string, path: string): { op: string; scope?: string } | undefined
```
**Parameters:**
- `method: string`
- `path: string`
**Returns:** `{ op: string; scope?: string } | undefined`

## contract.routes

### `mountContract`
```ts
mountContract<T>(app: T, opts?: MountContractOptions): T
```
**Parameters:**
- `app: T`
- `opts: MountContractOptions` (optional)
**Returns:** `T`
