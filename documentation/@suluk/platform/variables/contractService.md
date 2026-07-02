[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / contractService

# Variable: contractService

> `const` **contractService**: `object`

Defined in: [service.ts:246](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/platform/src/service.ts#L246)

## Type Declaration

### compose

> `readonly` **compose**: `object`

#### compose.exposes

> `readonly` **exposes**: `object`

#### compose.exposes.authApi

> `readonly` **authApi**: `object`

#### compose.exposes.authApi.hookOptKey

> `readonly` **hookOptKey**: `"authApi"` = `"authApi"`

#### compose.exposes.authApi.kind

> `readonly` **kind**: `"port"` = `"port"`

#### compose.exposes.authApi.render

> `readonly` **render**: (`e`) => `string`

##### Parameters

###### e

`string`[]

##### Returns

`string`

### deps

> `readonly` **deps**: \[`"@suluk/hono"`, `"zod"`\]

### id

> `readonly` **id**: `"contract"` = `"contract"`

### mount

> `readonly` **mount**: `object`

#### mount.from

> `readonly` **from**: `"./routes/contract"` = `"./routes/contract"`

#### mount.kind

> `readonly` **kind**: `"middleware"` = `"middleware"`

#### mount.symbol

> `readonly` **symbol**: `"mountContract"` = `"mountContract"`
