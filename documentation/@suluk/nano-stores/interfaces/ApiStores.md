[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/nano-stores](../README.md) / ApiStores

# Interface: ApiStores

Defined in: [tooling/ts/packages/nano-stores/src/stores.ts:99](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/nano-stores/src/stores.ts#L99)

## Properties

### ctx

> **ctx**: `object`

Defined in: [tooling/ts/packages/nano-stores/src/stores.ts:105](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/nano-stores/src/stores.ts#L105)

The shared @nanostores/query context (invalidateKeys / revalidateKeys / mutateCache).

#### \_\_unsafeOverruleSettings

> `readonly` **\_\_unsafeOverruleSettings**: (`data`) => `void`

##### Parameters

###### data

`CommonSettings`\<`unknown`\>

##### Returns

`void`

#### invalidateKeys

> `readonly` **invalidateKeys**: (`keySelector`) => `void`

##### Parameters

###### keySelector

`KeySelector`

##### Returns

`void`

#### mutateCache

> `readonly` **mutateCache**: (`keySelector`, `data?`) => `void`

##### Parameters

###### keySelector

`KeySelector`

###### data?

`unknown`

##### Returns

`void`

#### revalidateKeys

> `readonly` **revalidateKeys**: (`keySelector`) => `void`

##### Parameters

###### keySelector

`KeySelector`

##### Returns

`void`

***

### fetchers

> **fetchers**: `Record`\<`string`, [`FetcherFactory`](../type-aliases/FetcherFactory.md)\>

Defined in: [tooling/ts/packages/nano-stores/src/stores.ts:101](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/nano-stores/src/stores.ts#L101)

name → factory that, given path params, yields a lazy fetcher store.

***

### invalidate

> **invalidate**: (`routeNameOrUrl`) => `void`

Defined in: [tooling/ts/packages/nano-stores/src/stores.ts:107](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/nano-stores/src/stores.ts#L107)

Convenience over ctx.invalidateKeys: invalidate by route NAME (its built URLs) or by a raw URL/prefix.

#### Parameters

##### routeNameOrUrl

`string`

#### Returns

`void`

***

### mutators

> **mutators**: `Record`\<`string`, [`MutatorInvoker`](../type-aliases/MutatorInvoker.md)\>

Defined in: [tooling/ts/packages/nano-stores/src/stores.ts:103](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/nano-stores/src/stores.ts#L103)

name → mutator store (POST/PUT/PATCH/DELETE/…).

***

### warnings

> **warnings**: `string`[]

Defined in: [tooling/ts/packages/nano-stores/src/stores.ts:109](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/nano-stores/src/stores.ts#L109)

Non-fatal projection losses (e.g. a GET with no response schema → unvalidated). Never thrown.
