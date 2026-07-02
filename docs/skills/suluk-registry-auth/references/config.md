# Configuration

## AuthOptions

### Properties

#### baseURL

**Type:** `string`

#### trustedOrigins

**Type:** `string[]`

#### passkey

**Type:** `{ rpID: string; rpName: string; origin?: string | string[] }`

#### onUserCreated

run after a user is created (e.g. grant signup credits via @suluk/credits) — the auth ↔ credits seam. Receives the
 Worker `env` (so the hook can build its own Effect layers, e.g. `DbLive(env)`); @suluk/platform's composition wires it.

**Type:** `(userId: string, env: AuthEnv) => Promise<void>`

#### mcp

Turn the API-as-MCP server (`/api/mcp`) into an OAuth 2.1 authorization server (Better Auth's `mcp()` plugin composes
oidc-provider: the oauthApplication/oauthAccessToken/oauthConsent tables + `/.well-known/*` + `/api/auth/mcp/{authorize,
token,get-session}` + `/api/auth/oauth2/consent`). The GRANTED scopes should be your API's scope set — so an MCP
connection is gated + attributed by the SAME `enforceApiKeyScope` machinery as an api key (one surface). `loginPage`/
`consentPage` are your web pages (mid-OAuth sign-in + scope-selection). Omit to run without MCP OAuth.

**Type:** `{ loginPage: string; consentPage: string; resource: string; scopes: string[] }`