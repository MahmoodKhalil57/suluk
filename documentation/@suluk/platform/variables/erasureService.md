[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / erasureService

# Variable: erasureService

> `const` **erasureService**: `object`

Defined in: [service.ts:303](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/platform/src/service.ts#L303)

## Type Declaration

### compose

> `readonly` **compose**: `object`

#### compose.exposes

> `readonly` **exposes**: `object`

#### compose.exposes.cascade

> `readonly` **cascade**: `object`

#### compose.exposes.cascade.fanIn

> `readonly` **fanIn**: `true` = `true`

#### compose.exposes.cascade.hookOptKey

> `readonly` **hookOptKey**: `"extraSteps"` = `"extraSteps"`

#### compose.exposes.cascade.kind

> `readonly` **kind**: `"port"` = `"port"`

#### compose.exposes.cascade.render

> `readonly` **render**: (`exprs`) => `string`

##### Parameters

###### exprs

`string`[]

##### Returns

`string`

### contract

> `readonly` **contract**: `object`

#### contract.from

> `readonly` **from**: `"./contract/erasure"` = `"./contract/erasure"`

#### contract.symbol

> `readonly` **symbol**: `"erasureOps"` = `"erasureOps"`

### deps

> `readonly` **deps**: \[`"@suluk/better-auth"`\]

### id

> `readonly` **id**: `"erasure"` = `"erasure"`

### mount

> `readonly` **mount**: `object`

#### mount.from

> `readonly` **from**: `"./routes/erasure"` = `"./routes/erasure"`

#### mount.kind

> `readonly` **kind**: `"route"` = `"route"`

#### mount.path

> `readonly` **path**: `"/api/erasure"` = `"/api/erasure"`

#### mount.symbol

> `readonly` **symbol**: `"erasureRoutes"` = `"erasureRoutes"`

### provision

> `readonly` **provision**: `object`

#### provision.from

> `readonly` **from**: `"./src/provision/erasure"` = `"./src/provision/erasure"`

#### provision.symbol

> `readonly` **symbol**: `"erasureProvision"` = `"erasureProvision"`
