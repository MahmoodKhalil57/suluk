# Functions

## app

### `trustedOrigins`
The app-owned trusted-origin allowlist (from `TRUSTED_ORIGINS`). Keep it in sync with auth's `trustedOrigins`.
```ts
trustedOrigins(env: Pick<Bindings, "TRUSTED_ORIGINS">): string[]
```
**Parameters:**
- `env: Pick<Bindings, "TRUSTED_ORIGINS">`
**Returns:** `string[]`

### `createApp`
Create the base app. Mount a feature module's router: `app.route("/credits", creditsRoutes())`.
```ts
createApp(): any
```
**Returns:** `any`

### `DbLive`
Build the `Db` layer for one request from the Worker bindings.
```ts
DbLive(env: Bindings): Layer<Db>
```
**Parameters:**
- `env: Bindings`
**Returns:** `Layer<Db>`
