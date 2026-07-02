[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/nano-stores](../README.md) / DiscountStore

# Interface: DiscountStore

Defined in: [tooling/ts/packages/nano-stores/src/discount.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/nano-stores/src/discount.ts#L30)

## Properties

### $discount

> **$discount**: `ReadableAtom`\<[`AppliedDiscount`](AppliedDiscount.md) \| `null`\>

Defined in: [tooling/ts/packages/nano-stores/src/discount.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/nano-stores/src/discount.ts#L31)

## Methods

### apply()

> **apply**(`d`): `void`

Defined in: [tooling/ts/packages/nano-stores/src/discount.ts:34](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/nano-stores/src/discount.ts#L34)

set the applied discount (after the app validated it).

#### Parameters

##### d

[`AppliedDiscount`](AppliedDiscount.md)

#### Returns

`void`

***

### clear()

> **clear**(): `void`

Defined in: [tooling/ts/packages/nano-stores/src/discount.ts:36](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/nano-stores/src/discount.ts#L36)

remove the applied discount.

#### Returns

`void`

***

### destroy()

> **destroy**(): `void`

Defined in: [tooling/ts/packages/nano-stores/src/discount.ts:40](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/nano-stores/src/discount.ts#L40)

detach sync listeners.

#### Returns

`void`

***

### get()

> **get**(): [`AppliedDiscount`](AppliedDiscount.md) \| `null`

Defined in: [tooling/ts/packages/nano-stores/src/discount.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/nano-stores/src/discount.ts#L32)

#### Returns

[`AppliedDiscount`](AppliedDiscount.md) \| `null`

***

### reload()

> **reload**(): `void`

Defined in: [tooling/ts/packages/nano-stores/src/discount.ts:38](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/nano-stores/src/discount.ts#L38)

re-read from storage.

#### Returns

`void`
