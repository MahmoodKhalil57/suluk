[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / Service

# Interface: Service\<SO, BO\>

Defined in: [service.ts:109](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/platform/src/service.ts#L109)

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

Defined in: [service.ts:119](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/platform/src/service.ts#L119)

***

### compose?

> `readonly` `optional` **compose?**: [`CompositionSurface`](CompositionSurface.md)

Defined in: [service.ts:121](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/platform/src/service.ts#L121)

***

### contract?

> `readonly` `optional` **contract?**: `object`

Defined in: [service.ts:115](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/platform/src/service.ts#L115)

the module's CONTRACT fragment — its `RouteContract[]` (ops), composed into `src/contract.ops.ts` (mirrors `provision`).

#### from

> **from**: `string`

#### symbol

> **symbol**: `string`

***

### deps?

> `readonly` `optional` **deps?**: `string`[]

Defined in: [service.ts:116](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/platform/src/service.ts#L116)

***

### env?

> `readonly` `optional` **env?**: [`EnvVar`](EnvVar.md)[]

Defined in: [service.ts:117](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/platform/src/service.ts#L117)

***

### id

> `readonly` **id**: `string`

Defined in: [service.ts:110](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/platform/src/service.ts#L110)

***

### mount

> `readonly` **mount**: [`Mount`](../type-aliases/Mount.md)

Defined in: [service.ts:112](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/platform/src/service.ts#L112)

***

### provision?

> `readonly` `optional` **provision?**: `object`

Defined in: [service.ts:113](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/platform/src/service.ts#L113)

#### from

> **from**: `string`

#### symbol

> **symbol**: `string`

***

### reads?

> `readonly` `optional` **reads?**: `object`

Defined in: [service.ts:120](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/platform/src/service.ts#L120)

#### globalBrand?

> `optional` **globalBrand?**: `string`[]

#### globalService?

> `optional` **globalService?**: `string`[]

***

### registry?

> `readonly` `optional` **registry?**: `string`

Defined in: [service.ts:111](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/platform/src/service.ts#L111)

***

### serviceOpts?

> `readonly` `optional` **serviceOpts?**: [`Schema`](Schema.md)\<`SO`\>

Defined in: [service.ts:118](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/platform/src/service.ts#L118)
