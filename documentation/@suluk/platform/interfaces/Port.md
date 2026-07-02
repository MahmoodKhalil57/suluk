[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / Port

# Interface: Port\<P\>

Defined in: [service.ts:77](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/platform/src/service.ts#L77)

A typed PORT a service EXPOSES: a named hook others fill. `hookOptKey` is the mount-opt field a bound edge renders INTO
(e.g. auth's `onUserCreated`), so an edge never emits a separate post-route statement — it composes into the producer's
own mount call. `render` wraps the consumer expressions for this hook's real signature. (Consumed in Phase 3.)

## Type Parameters

### P

`P` = `unknown`

## Properties

### fanIn?

> `readonly` `optional` **fanIn?**: `boolean`

Defined in: [service.ts:84](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/platform/src/service.ts#L84)

documents a FAN-IN port (several capabilities aggregate into one hook, e.g. erasure's cascade). No engine branch —
 fan-in already works (the engine groups by port-owner + `render` takes the full `string[]`); this marks intent.

***

### hookOptKey

> `readonly` **hookOptKey**: `string`

Defined in: [service.ts:80](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/platform/src/service.ts#L80)

***

### kind

> `readonly` **kind**: `"port"`

Defined in: [service.ts:78](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/platform/src/service.ts#L78)

***

### param?

> `readonly` `optional` **param?**: [`Schema`](Schema.md)\<`P`\>

Defined in: [service.ts:79](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/platform/src/service.ts#L79)

***

### render

> `readonly` **render**: (`consumerExprs`) => `string`

Defined in: [service.ts:81](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/platform/src/service.ts#L81)

#### Parameters

##### consumerExprs

`string`[]

#### Returns

`string`
