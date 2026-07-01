[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / CatalogEntry

# Interface: CatalogEntry

Defined in: [service.ts:50](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/platform/src/service.ts#L50)

The old catalog record — now a DERIVED VIEW of a [Service](Service.md) (see [toCatalogEntry](../functions/toCatalogEntry.md)); kept so `planPlatform`
 and the C051 helpers read the same shape they always did.

## Properties

### deps?

> `optional` **deps?**: `string`[]

Defined in: [service.ts:53](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/platform/src/service.ts#L53)

***

### env?

> `optional` **env?**: [`EnvVar`](EnvVar.md)[]

Defined in: [service.ts:54](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/platform/src/service.ts#L54)

***

### mount

> **mount**: [`Mount`](../type-aliases/Mount.md)

Defined in: [service.ts:51](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/platform/src/service.ts#L51)

***

### provision?

> `optional` **provision?**: `object`

Defined in: [service.ts:52](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/platform/src/service.ts#L52)

#### from

> **from**: `string`

#### symbol

> **symbol**: `string`
