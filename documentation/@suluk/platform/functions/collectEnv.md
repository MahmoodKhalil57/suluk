[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / collectEnv

# Function: collectEnv()

> **collectEnv**(`services`, `catalog?`): [`EnvVar`](../interfaces/EnvVar.md)[]

Defined in: [catalog.ts:60](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/catalog.ts#L60)

The env vars the selected services need, de-duped by name (first declaration wins). Split with `.secret` into the
 `.env` secrets (the .env.temp lifecycle) vs the non-secret CONFIG (defined in platform.config.ts `vars` → wrangler `[vars]`).

## Parameters

### services

`string`[]

### catalog?

`Record`\<`string`, \{ `env?`: [`EnvVar`](../interfaces/EnvVar.md)[]; \}\> = `CATALOG`

## Returns

[`EnvVar`](../interfaces/EnvVar.md)[]
