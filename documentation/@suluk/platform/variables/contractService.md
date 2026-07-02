[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / contractService

# Variable: contractService

> `const` **contractService**: `object`

Defined in: [service.ts:246](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/platform/src/service.ts#L246)

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

#### compose.offers

> `readonly` **offers**: `object`

#### compose.offers.provideApiDocument

> `readonly` **provideApiDocument**: `object`

#### compose.offers.provideApiDocument.build

> `readonly` **build**: () => `string`

##### Returns

`string`

#### compose.offers.provideApiDocument.from

> `readonly` **from**: `"./contract"` = `"./contract"`

#### compose.offers.provideApiDocument.imports

> `readonly` **imports**: \[\{ `from`: `"./contract"`; `symbol`: `"apiDocument"`; \}\]

#### compose.offers.provideApiDocument.kind

> `readonly` **kind**: `"capability"` = `"capability"`

#### compose.offers.provideApiDocument.symbol

> `readonly` **symbol**: `"apiDocument"` = `"apiDocument"`

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
