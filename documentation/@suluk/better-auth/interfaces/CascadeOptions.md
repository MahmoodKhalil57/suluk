[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / CascadeOptions

# Interface: CascadeOptions

Defined in: [erasure.ts:21](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/better-auth/src/erasure.ts#L21)

## Properties

### continueOnError?

> `optional` **continueOnError?**: `boolean`

Defined in: [erasure.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/better-auth/src/erasure.ts#L24)

if a step throws: log + continue (true), or ABORT the whole cascade (false — the fail-closed default, so a
 failed cleanup never silently half-erases and then deletes the user).

***

### log?

> `optional` **log?**: (`step`, `error`) => `void`

Defined in: [erasure.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/better-auth/src/erasure.ts#L26)

diagnostics sink (default console.error).

#### Parameters

##### step

`string`

##### error

`unknown`

#### Returns

`void`
