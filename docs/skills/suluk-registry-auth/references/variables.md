# Variables & Constants

## auth

### `apiKeyAuth`
Programmatic auth via an `x-api-key` header (the api-key plugin) — when there is NO session, verify the key and stash its
OWNER + scopes + key id on the SAME slots a session sets, so a key caller reaches the metered API exactly like a user.
The verification (`verifyApiKey`) + permission→scope mapping stay in `@suluk/better-auth`; this is the wiring.
```ts
const apiKeyAuth: AppVars<AppCtx>
```

### `mcpBearerAuth`
The THIRD caller kind — an MCP OAuth bearer. When there is no session/api-key and the request carries
`Authorization: Bearer <oauth-token>`, resolve it through the mcp plugin's `getMcpSession` (the OAuthAccessToken's owner +
granted scopes) and stash the owner + scopes on the SAME slots an api key sets — so the connection is gated + attributed
by the EXACT same machinery (`enforceApiKeyScope`). The connection's id flows through `keyId` as `mcp:<userId>:<clientId>`.
Only enabled behavior when `opts.mcp` was passed to `buildAuth` (else `getMcpSession` is absent → a no-op).
```ts
const mcpBearerAuth: AppVars<AppCtx>
```

## auth.schema

### `user`
```ts
const user: any
```

### `session`
```ts
const session: any
```

### `account`
```ts
const account: any
```

### `verification`
```ts
const verification: any
```

### `apikey`
```ts
const apikey: any
```

### `passkey`
```ts
const passkey: any
```

### `oauthApplication`
```ts
const oauthApplication: any
```

### `oauthAccessToken`
```ts
const oauthAccessToken: any
```

### `oauthConsent`
```ts
const oauthConsent: any
```

## auth.provision

### `authProvision`
```ts
const authProvision: AppVars[]
```
