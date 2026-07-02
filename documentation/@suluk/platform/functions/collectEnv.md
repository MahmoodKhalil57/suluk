[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / collectEnv

# Function: collectEnv()

> **collectEnv**(`services`, `catalog?`): [`EnvVar`](../interfaces/EnvVar.md)[]

Defined in: [catalog.ts:60](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/platform/src/catalog.ts#L60)

The env vars the selected services need, de-duped by name (first declaration wins). Split with `.secret` into the
 `.env` secrets (the .env.temp lifecycle) vs the non-secret CONFIG (defined in platform.config.ts `vars` → wrangler `[vars]`).

## Parameters

### services

`string`[]

### catalog?

`Record`\<`string`, \{ `env?`: [`EnvVar`](../interfaces/EnvVar.md)[]; \}\> = `CATALOG`

## Returns

[`EnvVar`](../interfaces/EnvVar.md)[]
