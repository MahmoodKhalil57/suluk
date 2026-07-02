# Functions

## auth

### `authDevMock`
LOCAL-DEV any-email login is armed only in dev-mock: NOT production AND no real Google key. A deployed Worker sets
`ENVIRONMENT="production"` (a committed wrangler `[var]`), so this is FALSE in prod — the dev-login 404s there even if
Google is unconfigured. Locally (bun dev, no ENVIRONMENT) with no Google key ⇒ TRUE (the Google mock). Set GOOGLE_CLIENT_ID
locally to get real Google instead. This is the same `ENVIRONMENT !== "production"` dev signal @suluk/email uses.
```ts
authDevMock(env: AuthEnv & { ENVIRONMENT?: string }): boolean
```
**Parameters:**
- `env: AuthEnv & { ENVIRONMENT?: string }`
**Returns:** `boolean`

### `createAuth`
```ts
createAuth(env: AuthEnv, opts?: AuthOptions): any
```
**Parameters:**
- `env: AuthEnv`
- `opts: AuthOptions` (optional)
**Returns:** `any`

### `identity`
Resolve the Better Auth session ONCE per `/api/*` request and stash the principal on the context (so routes read
`c.get("user")` instead of re-running getSession). Skips `/api/auth/*` (those establish the session) and anonymous
(no cookie). A failed lookup degrades to anonymous — it never 500s. `roleScopes` (via AuthOptions? — pass your
map) turns a user's role into scopes (e.g. `{ admin: ["admin"] }`); without it, session callers carry no scopes (they
pass the key-scope gate regardless — only KEYED callers are scope-restricted).
```ts
identity(roleScopes?: Record<string, string[]>): MiddlewareHandler<AppCtx>
```
**Parameters:**
- `roleScopes: Record<string, string[]>` (optional)
**Returns:** `MiddlewareHandler<AppCtx>`

### `mountAuthRoutes`
Mount Better Auth on your app: the caller-resolution middleware (`identity` session · `apiKeyAuth` · `mcpBearerAuth`) on
`/api/*` FIRST, then the `/api/auth/*` handler. One auth instance per request's DB binding. Pass `roleScopes` to grant
scopes by role; pass `opts.mcp` (see AuthOptions) to enable the OAuth server + the bearer path.
```ts
mountAuthRoutes<T>(app: T, opts?: AuthOptions & { roleScopes?: Record<string, string[]> }): T
```
**Parameters:**
- `app: T`
- `opts: AuthOptions & { roleScopes?: Record<string, string[]> }` (optional)
**Returns:** `T`

### `getCurrentUser`
Resolve the session user from the request headers.
```ts
getCurrentUser(env: AuthEnv, headers: Headers, opts?: AuthOptions): Promise<SessionUser | null>
```
**Parameters:**
- `env: AuthEnv`
- `headers: Headers`
- `opts: AuthOptions` (optional)
**Returns:** `Promise<SessionUser | null>`

### `currentUserLayer`
A `CurrentUser` layer for one request — provide it alongside your feature service layers.
```ts
currentUserLayer(env: AuthEnv, headers: Headers, opts?: AuthOptions): Layer<CurrentUser>
```
**Parameters:**
- `env: AuthEnv`
- `headers: Headers`
- `opts: AuthOptions` (optional)
**Returns:** `Layer<CurrentUser>`
