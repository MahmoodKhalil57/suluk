[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / referenceService

# Variable: referenceService

> `const` **referenceService**: `object`

Defined in: [service.ts:345](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/platform/src/service.ts#L345)

## Type Declaration

### compose

> `readonly` **compose**: `object`

#### compose.exposes

> `readonly` **exposes**: `object`

#### compose.exposes.apiDocument

> `readonly` **apiDocument**: `object`

#### compose.exposes.apiDocument.hookOptKey

> `readonly` **hookOptKey**: `"apiDocument"` = `"apiDocument"`

#### compose.exposes.apiDocument.kind

> `readonly` **kind**: `"port"` = `"port"`

#### compose.exposes.apiDocument.render

> `readonly` **render**: (`e`) => `string`

##### Parameters

###### e

`string`[]

##### Returns

`string`

### contract

> `readonly` **contract**: `object`

#### contract.from

> `readonly` **from**: `"./contract/reference"` = `"./contract/reference"`

#### contract.symbol

> `readonly` **symbol**: `"referenceOps"` = `"referenceOps"`

### deps

> `readonly` **deps**: \[`"@suluk/reference"`\]

### id

> `readonly` **id**: `"reference"` = `"reference"`

### mount

> `readonly` **mount**: `object`

#### mount.from

> `readonly` **from**: `"./routes/reference"` = `"./routes/reference"`

#### mount.kind

> `readonly` **kind**: `"route"` = `"route"`

#### mount.path

> `readonly` **path**: `"/api/reference"` = `"/api/reference"`

#### mount.symbol

> `readonly` **symbol**: `"referenceRoutes"` = `"referenceRoutes"`

### requires

> `readonly` **requires**: \[`"contract"`\]
