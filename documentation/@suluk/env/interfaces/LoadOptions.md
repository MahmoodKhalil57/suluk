[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/env](../README.md) / LoadOptions

# Interface: LoadOptions

Defined in: [load.ts:10](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/env/src/load.ts#L10)

## Properties

### content

> **content**: `string`

Defined in: [load.ts:12](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/env/src/load.ts#L12)

the .env file text (with encrypted tokens).

***

### override?

> `optional` **override?**: `boolean`

Defined in: [load.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/env/src/load.ts#L18)

overwrite keys already set in the target (default false — a real environment variable wins over the file).

***

### privateKey?

> `optional` **privateKey?**: `string`

Defined in: [load.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/env/src/load.ts#L14)

SULUK_PRIVATE_KEY — required iff any value is encrypted.

***

### target?

> `optional` **target?**: `Record`\<`string`, `string` \| `undefined`\>

Defined in: [load.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/env/src/load.ts#L16)

where to inject (default: process.env when it exists). Pass an object to capture without touching the real env.
