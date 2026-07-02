[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / Service

# Interface: Service\<SO, BO\>

Defined in: [service.ts:107](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/platform/src/service.ts#L107)

THE COMMON INTERFACE. `SO` = the service-opts value type, `BO` = the brand-opts value type (both Phase 2). A core service
and a community service instantiate the exact same shape via [defineService](../functions/defineService.md).

## Type Parameters

### SO

`SO` = \{ \}

### BO

`BO` = \{ \}

## Properties

### brandOpts?

> `readonly` `optional` **brandOpts?**: [`Schema`](Schema.md)\<`BO`\>

Defined in: [service.ts:115](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/platform/src/service.ts#L115)

***

### compose?

> `readonly` `optional` **compose?**: [`CompositionSurface`](CompositionSurface.md)

Defined in: [service.ts:117](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/platform/src/service.ts#L117)

***

### deps?

> `readonly` `optional` **deps?**: `string`[]

Defined in: [service.ts:112](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/platform/src/service.ts#L112)

***

### env?

> `readonly` `optional` **env?**: [`EnvVar`](EnvVar.md)[]

Defined in: [service.ts:113](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/platform/src/service.ts#L113)

***

### id

> `readonly` **id**: `string`

Defined in: [service.ts:108](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/platform/src/service.ts#L108)

***

### mount

> `readonly` **mount**: [`Mount`](../type-aliases/Mount.md)

Defined in: [service.ts:110](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/platform/src/service.ts#L110)

***

### provision?

> `readonly` `optional` **provision?**: `object`

Defined in: [service.ts:111](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/platform/src/service.ts#L111)

#### from

> **from**: `string`

#### symbol

> **symbol**: `string`

***

### reads?

> `readonly` `optional` **reads?**: `object`

Defined in: [service.ts:116](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/platform/src/service.ts#L116)

#### globalBrand?

> `optional` **globalBrand?**: `string`[]

#### globalService?

> `optional` **globalService?**: `string`[]

***

### registry?

> `readonly` `optional` **registry?**: `string`

Defined in: [service.ts:109](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/platform/src/service.ts#L109)

***

### serviceOpts?

> `readonly` `optional` **serviceOpts?**: [`Schema`](Schema.md)\<`SO`\>

Defined in: [service.ts:114](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/platform/src/service.ts#L114)
