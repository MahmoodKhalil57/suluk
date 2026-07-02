[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/nano-stores](../README.md) / CartStore

# Interface: CartStore

Defined in: [tooling/ts/packages/nano-stores/src/cart.ts:55](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/nano-stores/src/cart.ts#L55)

## Properties

### $count

> **$count**: `ReadableAtom`\<`number`\>

Defined in: [tooling/ts/packages/nano-stores/src/cart.ts:63](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/nano-stores/src/cart.ts#L63)

total quantity across all lines.

***

### $items

> **$items**: `MapStore`\<`Record`\<`string`, [`CartLine`](CartLine.md)\>\>

Defined in: [tooling/ts/packages/nano-stores/src/cart.ts:61](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/nano-stores/src/cart.ts#L61)

lines keyed by an OPAQUE prefixed id — subscribe for reactive UI, but render from `lines()` (insertion
order) and look lines up with `get(productId)`. (Keys are prefixed so the JS engine preserves insertion
order even for numeric product ids, which it would otherwise hoist ahead of string ids.)

***

### $subtotalCents

> **$subtotalCents**: `ReadableAtom`\<`number`\>

Defined in: [tooling/ts/packages/nano-stores/src/cart.ts:65](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/nano-stores/src/cart.ts#L65)

Σ qty·priceCents — the cart subtotal in cents (pre-discount, pre-tax).

## Methods

### add()

> **add**(`item`): `void`

Defined in: [tooling/ts/packages/nano-stores/src/cart.ts:71](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/nano-stores/src/cart.ts#L71)

add `item.qty` of a product/variant (merges onto an existing line by product+variant; refreshes name/price/image).

#### Parameters

##### item

[`CartLine`](CartLine.md)

#### Returns

`void`

***

### clear()

> **clear**(): `void`

Defined in: [tooling/ts/packages/nano-stores/src/cart.ts:77](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/nano-stores/src/cart.ts#L77)

empty the cart.

#### Returns

`void`

***

### destroy()

> **destroy**(): `void`

Defined in: [tooling/ts/packages/nano-stores/src/cart.ts:81](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/nano-stores/src/cart.ts#L81)

detach the sync listeners (for teardown/tests).

#### Returns

`void`

***

### get()

> **get**(`productId`, `variantId?`): [`CartLine`](CartLine.md) \| `undefined`

Defined in: [tooling/ts/packages/nano-stores/src/cart.ts:69](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/nano-stores/src/cart.ts#L69)

the line for a product (+ optional variant), or undefined.

#### Parameters

##### productId

`string` \| `number`

##### variantId?

`string` \| `number`

#### Returns

[`CartLine`](CartLine.md) \| `undefined`

***

### lines()

> **lines**(): [`CartLine`](CartLine.md)[]

Defined in: [tooling/ts/packages/nano-stores/src/cart.ts:67](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/nano-stores/src/cart.ts#L67)

the lines as an array, in insertion order — the canonical render source.

#### Returns

[`CartLine`](CartLine.md)[]

***

### reload()

> **reload**(): `void`

Defined in: [tooling/ts/packages/nano-stores/src/cart.ts:79](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/nano-stores/src/cart.ts#L79)

re-read from storage (auto-invoked on the storage/change events; exposed for manual refresh).

#### Returns

`void`

***

### remove()

> **remove**(`productId`, `variantId?`): `void`

Defined in: [tooling/ts/packages/nano-stores/src/cart.ts:75](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/nano-stores/src/cart.ts#L75)

remove a line entirely (optionally a specific variant line).

#### Parameters

##### productId

`string` \| `number`

##### variantId?

`string` \| `number`

#### Returns

`void`

***

### setQty()

> **setQty**(`productId`, `qty`, `variantId?`): `void`

Defined in: [tooling/ts/packages/nano-stores/src/cart.ts:73](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/nano-stores/src/cart.ts#L73)

set a line's quantity; `qty <= 0` removes the line. Pass `variantId` to target a specific variant line.

#### Parameters

##### productId

`string` \| `number`

##### qty

`number`

##### variantId?

`string` \| `number`

#### Returns

`void`
