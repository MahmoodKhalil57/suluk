# Functions

## email.service

### `emailCfgFromEnv`
Build the config from env — console provider unless production AND a key AND a from-address are all present.
```ts
emailCfgFromEnv(env: EmailEnv): EmailConfig
```
**Parameters:**
- `env: EmailEnv`
**Returns:** `EmailConfig`

### `EmailCfgLive`
```ts
EmailCfgLive(env: EmailEnv): Layer<EmailCfg>
```
**Parameters:**
- `env: EmailEnv`
**Returns:** `Layer<EmailCfg>`

## email.routes

### `emailRoutes`
```ts
emailRoutes(): any
```
**Returns:** `any`
