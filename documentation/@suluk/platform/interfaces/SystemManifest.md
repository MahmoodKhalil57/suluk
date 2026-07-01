[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / SystemManifest

# Interface: SystemManifest\<T\>

Defined in: [manifest.ts:56](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/platform/src/manifest.ts#L56)

A SYSTEM — the reusable, publishable template. Generic over the services tuple so `serviceOpts` is typed by service id.

## Type Parameters

### T

`T` *extends* readonly [`ServiceRef`](../type-aliases/ServiceRef.md)[] = readonly [`ServiceRef`](../type-aliases/ServiceRef.md)[]

## Properties

### globalServiceOpts?

> `optional` **globalServiceOpts?**: `Record`\<`string`, `unknown`\>

Defined in: [manifest.ts:64](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/platform/src/manifest.ts#L64)

system-wide behaviour shared by services; a service receives the keys it names in `reads.globalService` (else inert).

***

### local?

> `optional` **local?**: `boolean`

Defined in: [manifest.ts:71](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/platform/src/manifest.ts#L71)

emit the MOCK-PROVIDER dev runtime (a `src/dev.ts` bun server with a bun:sqlite DB + JSON KV + mocked providers when
 keys are absent). A SYSTEM-level property (the app structure), swappable per brand only if a brand overrides it.

***

### registries?

> `optional` **registries?**: `Record`\<`string`, `string`\>

Defined in: [manifest.ts:60](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/platform/src/manifest.ts#L60)

alias → registry map for multi-registry systems (Phase 4). `registries.core` is the default when `registry` is unset.

***

### registry?

> `optional` **registry?**: `string`

Defined in: [manifest.ts:58](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/platform/src/manifest.ts#L58)

the single core registry, e.g. "MahmoodKhalil57/suluk". (Multi-registry alias map: `registries`, Phase 4.)

***

### serviceOpts?

> `optional` **serviceOpts?**: `Partial`\<`{ [K in ServiceRef as IdOf<K>]: SoOf<K> }`\>

Defined in: [manifest.ts:66](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/platform/src/manifest.ts#L66)

per-service serviceOpts — TYPED by service id off the imported service objects.

***

### services

> **services**: `T`

Defined in: [manifest.ts:62](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/platform/src/manifest.ts#L62)

the services, in mount order — imported [Service](Service.md) objects (typed) and/or string ids.

***

### wire?

> `optional` **wire?**: [`WireDecl`](WireDecl.md)[]

Defined in: [manifest.ts:68](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/platform/src/manifest.ts#L68)

inter-service composition edges (Phase 3).
