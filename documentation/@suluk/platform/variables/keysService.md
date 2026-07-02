[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / keysService

# Variable: keysService

> `const` **keysService**: `object`

Defined in: [service.ts:286](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/platform/src/service.ts#L286)

## Type Declaration

### compose

> `readonly` **compose**: `object`

#### compose.exposes

> `readonly` **exposes**: `object`

#### compose.exposes.createKey

> `readonly` **createKey**: `object`

#### compose.exposes.createKey.hookOptKey

> `readonly` **hookOptKey**: `"createKey"` = `"createKey"`

#### compose.exposes.createKey.kind

> `readonly` **kind**: `"port"` = `"port"`

#### compose.exposes.createKey.render

> `readonly` **render**: (`e`) => `string`

##### Parameters

###### e

`string`[]

##### Returns

`string`

#### compose.offers

> `readonly` **offers**: `object`

#### compose.offers.eraseStep

> `readonly` **eraseStep**: [`Capability`](../interfaces/Capability.md)\<`unknown`\>

### contract

> `readonly` **contract**: `object`

#### contract.from

> `readonly` **from**: `"./contract/keys"` = `"./contract/keys"`

#### contract.symbol

> `readonly` **symbol**: `"keysOps"` = `"keysOps"`

### deps

> `readonly` **deps**: \[`"@suluk/keys"`\]

### id

> `readonly` **id**: `"keys"` = `"keys"`

### mount

> `readonly` **mount**: `object`

#### mount.from

> `readonly` **from**: `"./routes/keys"` = `"./routes/keys"`

#### mount.kind

> `readonly` **kind**: `"route"` = `"route"`

#### mount.path

> `readonly` **path**: `"/api/keys"` = `"/api/keys"`

#### mount.symbol

> `readonly` **symbol**: `"keysRoutes"` = `"keysRoutes"`

### provision

> `readonly` **provision**: `object`

#### provision.from

> `readonly` **from**: `"./src/provision/keys"` = `"./src/provision/keys"`

#### provision.symbol

> `readonly` **symbol**: `"keysProvision"` = `"keysProvision"`

### requires

> `readonly` **requires**: \[`"auth"`\]
