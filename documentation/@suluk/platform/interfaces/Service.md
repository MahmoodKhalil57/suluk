[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / Service

# Interface: Service\<SO, BO\>

Defined in: [service.ts:112](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/platform/src/service.ts#L112)

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

Defined in: [service.ts:126](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/platform/src/service.ts#L126)

***

### compose?

> `readonly` `optional` **compose?**: [`CompositionSurface`](CompositionSurface.md)

Defined in: [service.ts:128](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/platform/src/service.ts#L128)

***

### contract?

> `readonly` `optional` **contract?**: `object`

Defined in: [service.ts:118](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/platform/src/service.ts#L118)

the module's CONTRACT fragment — its `RouteContract[]` (ops), composed into `src/contract.ops.ts` (mirrors `provision`).

#### from

> **from**: `string`

#### symbol

> **symbol**: `string`

***

### deps?

> `readonly` `optional` **deps?**: `string`[]

Defined in: [service.ts:119](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/platform/src/service.ts#L119)

***

### env?

> `readonly` `optional` **env?**: [`EnvVar`](EnvVar.md)[]

Defined in: [service.ts:124](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/platform/src/service.ts#L124)

***

### id

> `readonly` **id**: `string`

Defined in: [service.ts:113](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/platform/src/service.ts#L113)

***

### mount

> `readonly` **mount**: [`Mount`](../type-aliases/Mount.md)

Defined in: [service.ts:115](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/platform/src/service.ts#L115)

***

### provision?

> `readonly` `optional` **provision?**: `object`

Defined in: [service.ts:116](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/platform/src/service.ts#L116)

#### from

> **from**: `string`

#### symbol

> **symbol**: `string`

***

### reads?

> `readonly` `optional` **reads?**: `object`

Defined in: [service.ts:127](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/platform/src/service.ts#L127)

#### globalBrand?

> `optional` **globalBrand?**: `string`[]

#### globalService?

> `optional` **globalService?**: `string`[]

***

### registry?

> `readonly` `optional` **registry?**: `string`

Defined in: [service.ts:114](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/platform/src/service.ts#L114)

***

### requires?

> `readonly` `optional` **requires?**: `string`[]

Defined in: [service.ts:123](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/platform/src/service.ts#L123)

MOUNT peers this module needs at RUNTIME (distinct from npm `deps`): e.g. a route that reads `c.get("user")`/scopes
 set by `mountAuthRoutes` declares `requires: ["auth"]`. The generator ERRORS if a selected service's requires aren't
 also selected — turning a silently-unauthenticated subset into a build failure, without force-adding auth everywhere.

***

### serviceOpts?

> `readonly` `optional` **serviceOpts?**: [`Schema`](Schema.md)\<`SO`\>

Defined in: [service.ts:125](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/platform/src/service.ts#L125)
