[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / PlatformManifest

# Interface: PlatformManifest

Defined in: [manifest.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/platform/src/manifest.ts#L14)

The C051 legacy manifest — still valid, still the byte-identity anchor.

## Properties

### \_\_localHost?

> `optional` **\_\_localHost?**: `string`

Defined in: [manifest.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/platform/src/manifest.ts#L29)

C058 (INTERNAL, dev-only) — the raw local host (e.g. `localhost:8787`), so `src/dev.ts` can re-splice the actual PORT.

***

### local?

> `optional` **local?**: `boolean`

Defined in: [manifest.ts:33](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/platform/src/manifest.ts#L33)

emit the MOCK-PROVIDER dev runtime: a `src/dev.ts` that runs the app under bun with a bun:sqlite DB + JSON-file KV +
 mocked providers when their keys are absent (mock-until-keyed), and the `dev` script pointed at it. Default false →
 the scaffold is byte-for-byte the C051 golden.

***

### localVars?

> `optional` **localVars?**: `Record`\<`string`, `string`\>

Defined in: [manifest.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/platform/src/manifest.ts#L27)

C058 (INTERNAL, dev-only) — the LOCAL-runtime derived URL vars (BASE_URL/BETTER_AUTH_URL/TRUSTED_ORIGINS/EMAIL_FROM),
 computed by `deriveHosts` from `LOCAL_BASE_URL`. Spread into `src/dev.ts`'s env; NEVER emitted to `[vars]`.

***

### name

> **name**: `string`

Defined in: [manifest.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/platform/src/manifest.ts#L16)

the app/repo name (used in the generated scaffold).

***

### opts?

> `optional` **opts?**: `Record`\<`string`, `Record`\<`string`, `unknown`\>\>

Defined in: [manifest.ts:22](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/platform/src/manifest.ts#L22)

per-service static OPTIONS passed to that service's mount in the generated entry (JSON-serializable).

***

### registry

> **registry**: `string`

Defined in: [manifest.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/platform/src/manifest.ts#L18)

the shadcn registry, e.g. "MahmoodKhalil57/suluk".

***

### services

> **services**: `string`[]

Defined in: [manifest.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/platform/src/manifest.ts#L20)

the services to include, in mount order — resolved against the catalog. `app` + `auth` are implied if any is listed.

***

### vars?

> `optional` **vars?**: `Record`\<`string`, `string`\>

Defined in: [manifest.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/platform/src/manifest.ts#L24)

NON-SECRET config values → generated into `wrangler.toml` `[vars]`. SECRETS never go here (they live in `.env`).
