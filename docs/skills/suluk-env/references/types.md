# Types & Enums

## crypto

### `Keypair`
`@suluk/env` — config + secrets as a single source of truth, made post-quantum-safe.

Declare each variable ONCE with defineEnv (typed, per-surface, secret-aware); encrypt secret VALUES with
ML-KEM-768 + AES-256-GCM so the .env is safe to commit to git and share over public channels; and project the
one declaration into every surface — local, Cloudflare, preview, a teammate's machine, the VS Code extension,
the admin panel. dotenvx's commit-safely model, quantum-safe, Suluk-native.

This entry is RUNTIME-AGNOSTIC (Web Crypto + @noble/post-quantum only — no node:fs), so it imports cleanly in
a Cloudflare Worker. Filesystem helpers + the CLI live in `@suluk/env/node`.
**Properties:**
- `publicKey: string` — `mlkem768:<base64>` — commit/share this; it can only ENCRYPT.
- `privateKey: string` — `mlkem768:<base64>` — keep secret (.env.keys / a secret binding); it can DECRYPT.

## schema

### `EnvSpec`
```ts
Record<string, VarSpec>
```

### `VarSpec`
**Properties:**
- `secret: boolean` (optional) — a secret — its value must be ENCRYPTED at rest in the committed .env (plaintext is flagged).
- `required: boolean` (optional) — must be present (after defaults) — else parse() throws and health = "missing".
- `default: string` (optional) — fallback value when absent.
- `surfaces: Surface[]` (optional) — which surfaces need this var (default: every surface). Drives the deploy/vscode projections.
- `description: string` (optional)
- `example: string` (optional)
- `pattern: string | RegExp` (optional) — the value, when present, must match this regex (source string or RegExp).
- `minLength: number` (optional) — the value, when present, must be at least this long (a too-short secret is a real misconfiguration).
- `requiredInSurface: Surface[]` (optional) — required ONLY when validating for one of these surfaces (in addition to `required`, which is always).
- `forbidInSurface: { pattern: string | RegExp; surfaces: Surface[]; message?: string; severity?: IssueSeverity }[]` (optional) — value patterns that are FORBIDDEN on specific surfaces — e.g. a `sk_test_` key on `cloudflare`. Default
 severity "warning" (a gated nudge); set "error" to fail closed.

### `Surface`
```ts
"local" | "cloudflare" | "preview" | "ci" | "vscode" | string & {}
```

### `DefinedEnv`
**Properties:**
- `spec: S`
- `keys: (keyof S & string)[]`

### `ManifestEntry`
**Properties:**
- `name: string`
- `secret: boolean`
- `required: boolean`
- `surfaces: Surface[]`
- `description: string` (optional)
- `example: string` (optional)
- `present: boolean`
- `encrypted: boolean`
- `status: HealthStatus`

### `HealthStatus`
```ts
"ok" | "missing" | "plaintext-secret" | "empty"
```

### `Parsed`
```ts
{ [K in ParsedKeys<S>]: string } & { [K in Exclude<keyof S, ParsedKeys<S>>]?: string }
```

### `EnvIssue`
**Properties:**
- `name: string`
- `severity: IssueSeverity`
- `code: "missing" | "too-short" | "pattern" | "forbidden-in-surface"`
- `message: string`

### `IssueSeverity`
```ts
"error" | "warning"
```
