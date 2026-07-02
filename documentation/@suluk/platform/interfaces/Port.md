[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / Port

# Interface: Port\<P\>

Defined in: [service.ts:75](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/service.ts#L75)

A typed PORT a service EXPOSES: a named hook others fill. `hookOptKey` is the mount-opt field a bound edge renders INTO
(e.g. auth's `onUserCreated`), so an edge never emits a separate post-route statement — it composes into the producer's
own mount call. `render` wraps the consumer expressions for this hook's real signature. (Consumed in Phase 3.)

## Type Parameters

### P

`P` = `unknown`

## Properties

### hookOptKey

> `readonly` **hookOptKey**: `string`

Defined in: [service.ts:78](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/service.ts#L78)

***

### kind

> `readonly` **kind**: `"port"`

Defined in: [service.ts:76](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/service.ts#L76)

***

### param?

> `readonly` `optional` **param?**: [`Schema`](Schema.md)\<`P`\>

Defined in: [service.ts:77](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/service.ts#L77)

***

### render

> `readonly` **render**: (`consumerExprs`) => `string`

Defined in: [service.ts:79](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/service.ts#L79)

#### Parameters

##### consumerExprs

`string`[]

#### Returns

`string`
