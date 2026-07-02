[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / EnvVar

# Interface: EnvVar

Defined in: [service.ts:21](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/platform/src/service.ts#L21)

An env var a module (or the app's provisioning) needs — drives the generated `env.ts`, `.env.example`, `.env.temp`, the
 env-check preflight, and the provision/sync-secrets scripts.

## Properties

### generated?

> `optional` **generated?**: `boolean`

Defined in: [service.ts:45](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/platform/src/service.ts#L45)

a random secret the provisioning flow AUTO-GENERATES (e.g. `BETTER_AUTH_SECRET` ← 32 random bytes) if not already set —
 so the operator never supplies it in `.env.temp`; it still lands ENCRYPTED in the committed `.env`.

***

### hint?

> `optional` **hint?**: `string`

Defined in: [service.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/platform/src/service.ts#L28)

a one-line hint shown as a comment.

***

### minted?

> `optional` **minted?**: `boolean`

Defined in: [service.ts:42](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/platform/src/service.ts#L42)

a scoped least-privilege token MINTED during provisioning (from the master), then kept ENCRYPTED in `.env`. `surface: "local"`.

***

### name

> **name**: `string`

Defined in: [service.ts:22](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/platform/src/service.ts#L22)

***

### provisioning?

> `optional` **provisioning?**: `boolean`

Defined in: [service.ts:40](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/platform/src/service.ts#L40)

An EPHEMERAL provisioning credential (e.g. the Cloudflare API master token): supplied PLAINTEXT in `.env.temp`, used to
provision infra + mint scoped tokens, then DELETED after provisioning — never committed (not even encrypted). Implies
`surface: "local"`.

***

### required?

> `optional` **required?**: `boolean`

Defined in: [service.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/platform/src/service.ts#L24)

the app WON'T work without it (the "minimum keys") — the env-check requires a non-empty value before it's happy.

***

### secret?

> `optional` **secret?**: `boolean`

Defined in: [service.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/platform/src/service.ts#L26)

a credential (encrypted at rest in the committed `.env`, or — if `provisioning` — staged plaintext in `.env.temp`).

***

### surface?

> `optional` **surface?**: `"local"` \| `"cloudflare"`

Defined in: [service.ts:34](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/platform/src/service.ts#L34)

Where the value is USED. `"cloudflare"` = a Worker RUNTIME secret (pushed by `sync-secrets` / decrypted by `loadEnv`);
`"local"` = used only by provisioning/deploy on this machine, NEVER shipped to the Worker. Defaults: a `secret` → the
Worker runtime (`"cloudflare"`); a `provisioning`/`minted` cred → `"local"`.
