[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / PlatformManifest

# Interface: PlatformManifest

Defined in: [manifest.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/platform/src/manifest.ts#L14)

The C051 legacy manifest — still valid, still the byte-identity anchor.

## Properties

### local?

> `optional` **local?**: `boolean`

Defined in: [manifest.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/platform/src/manifest.ts#L28)

emit the MOCK-PROVIDER dev runtime: a `src/dev.ts` that runs the app under bun with a bun:sqlite DB + JSON-file KV +
 mocked providers when their keys are absent (mock-until-keyed), and the `dev` script pointed at it. Default false →
 the scaffold is byte-for-byte the C051 golden.

***

### name

> **name**: `string`

Defined in: [manifest.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/platform/src/manifest.ts#L16)

the app/repo name (used in the generated scaffold).

***

### opts?

> `optional` **opts?**: `Record`\<`string`, `Record`\<`string`, `unknown`\>\>

Defined in: [manifest.ts:22](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/platform/src/manifest.ts#L22)

per-service static OPTIONS passed to that service's mount in the generated entry (JSON-serializable).

***

### registry

> **registry**: `string`

Defined in: [manifest.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/platform/src/manifest.ts#L18)

the shadcn registry, e.g. "MahmoodKhalil57/suluk".

***

### services

> **services**: `string`[]

Defined in: [manifest.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/platform/src/manifest.ts#L20)

the services to include, in mount order — resolved against the catalog. `app` + `auth` are implied if any is listed.

***

### vars?

> `optional` **vars?**: `Record`\<`string`, `string`\>

Defined in: [manifest.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/platform/src/manifest.ts#L24)

NON-SECRET config values → generated into `wrangler.toml` `[vars]`. SECRETS never go here (they live in `.env`).
