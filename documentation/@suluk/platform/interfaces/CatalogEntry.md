[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / CatalogEntry

# Interface: CatalogEntry

Defined in: [service.ts:50](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/platform/src/service.ts#L50)

The old catalog record — now a DERIVED VIEW of a [Service](Service.md) (see [toCatalogEntry](../functions/toCatalogEntry.md)); kept so `planPlatform`
 and the C051 helpers read the same shape they always did.

## Properties

### contract?

> `optional` **contract?**: `object`

Defined in: [service.ts:54](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/platform/src/service.ts#L54)

the module's CONTRACT fragment — its `RouteContract[]` (ops), composed into `src/contract.ops.ts` (mirrors `provision`).

#### from

> **from**: `string`

#### symbol

> **symbol**: `string`

***

### deps?

> `optional` **deps?**: `string`[]

Defined in: [service.ts:55](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/platform/src/service.ts#L55)

***

### env?

> `optional` **env?**: [`EnvVar`](EnvVar.md)[]

Defined in: [service.ts:56](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/platform/src/service.ts#L56)

***

### mount

> **mount**: [`Mount`](../type-aliases/Mount.md)

Defined in: [service.ts:51](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/platform/src/service.ts#L51)

***

### provision?

> `optional` **provision?**: `object`

Defined in: [service.ts:52](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/platform/src/service.ts#L52)

#### from

> **from**: `string`

#### symbol

> **symbol**: `string`
