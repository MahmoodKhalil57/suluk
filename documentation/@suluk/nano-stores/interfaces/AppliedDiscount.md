[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/nano-stores](../README.md) / AppliedDiscount

# Interface: AppliedDiscount

Defined in: [tooling/ts/packages/nano-stores/src/discount.ts:11](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/nano-stores/src/discount.ts#L11)

A validated, applied discount. `type`/`value` mirror @suluk/stripe's Discount so the money core can consume it.

## Properties

### code

> **code**: `string`

Defined in: [tooling/ts/packages/nano-stores/src/discount.ts:12](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/nano-stores/src/discount.ts#L12)

***

### type

> **type**: `"percent"` \| `"fixed"`

Defined in: [tooling/ts/packages/nano-stores/src/discount.ts:13](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/nano-stores/src/discount.ts#L13)

***

### validatedAt?

> `optional` **validatedAt?**: `number`

Defined in: [tooling/ts/packages/nano-stores/src/discount.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/nano-stores/src/discount.ts#L16)

epoch ms when it was validated — lets the app re-validate stale discounts.

***

### value

> **value**: `number`

Defined in: [tooling/ts/packages/nano-stores/src/discount.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/nano-stores/src/discount.ts#L14)
