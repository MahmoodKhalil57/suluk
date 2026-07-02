[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / Capability

# Interface: Capability\<A\>

Defined in: [service.ts:93](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/platform/src/service.ts#L93)

A typed CAPABILITY a service OFFERS to fill a port. `build` produces the consumer EXPRESSION rendered into the producer's
hook closure — it may reference the closure's fixed params `userId` and `env` (the seam threads env), plus the symbols it
declares in `imports` (all TRUSTED — from the service definition, never manifest free text). `with` is the wire's
schema-validated params (JSON data only). (Consumed in Phase 3.)

## Type Parameters

### A

`A` = `unknown`

## Properties

### build

> `readonly` **build**: (`ctx`) => `string`

Defined in: [service.ts:99](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/platform/src/service.ts#L99)

#### Parameters

##### ctx

###### with

`Record`\<`string`, `unknown`\>

#### Returns

`string`

***

### from

> `readonly` **from**: `string`

Defined in: [service.ts:97](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/platform/src/service.ts#L97)

***

### imports?

> `readonly` `optional` **imports?**: `object`[]

Defined in: [service.ts:98](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/platform/src/service.ts#L98)

#### from

> **from**: `string`

#### symbol

> **symbol**: `string`

***

### kind

> `readonly` **kind**: `"capability"`

Defined in: [service.ts:94](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/platform/src/service.ts#L94)

***

### param?

> `readonly` `optional` **param?**: [`Schema`](Schema.md)\<`A`\>

Defined in: [service.ts:95](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/platform/src/service.ts#L95)

***

### symbol

> `readonly` **symbol**: `string`

Defined in: [service.ts:96](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/platform/src/service.ts#L96)
