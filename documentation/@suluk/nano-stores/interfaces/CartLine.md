[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/nano-stores](../README.md) / CartLine

# Interface: CartLine

Defined in: [tooling/ts/packages/nano-stores/src/cart.ts:21](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/nano-stores/src/cart.ts#L21)

One cart line. The merge key is (`productId`, `variantId`) — two variants of one product are DISTINCT lines.
 `priceCents` is the unit price at add-time; `image`/`variantLabel` let the drawer + checkout render richly.

## Properties

### image?

> `optional` **image?**: `string`

Defined in: [tooling/ts/packages/nano-stores/src/cart.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/nano-stores/src/cart.ts#L29)

the line's display image (the variant's, falling back to the product's) — for the cart drawer + checkout.

***

### name

> **name**: `string`

Defined in: [tooling/ts/packages/nano-stores/src/cart.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/nano-stores/src/cart.ts#L27)

***

### priceCents

> **priceCents**: `number`

Defined in: [tooling/ts/packages/nano-stores/src/cart.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/nano-stores/src/cart.ts#L26)

***

### productId

> **productId**: `string` \| `number`

Defined in: [tooling/ts/packages/nano-stores/src/cart.ts:22](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/nano-stores/src/cart.ts#L22)

***

### qty

> **qty**: `number`

Defined in: [tooling/ts/packages/nano-stores/src/cart.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/nano-stores/src/cart.ts#L25)

***

### variantId?

> `optional` **variantId?**: `string` \| `number`

Defined in: [tooling/ts/packages/nano-stores/src/cart.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/nano-stores/src/cart.ts#L24)

the selected variant, if any — part of the merge key so size/colour pick distinct lines.

***

### variantLabel?

> `optional` **variantLabel?**: `string`

Defined in: [tooling/ts/packages/nano-stores/src/cart.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/nano-stores/src/cart.ts#L31)

a human label for the chosen variant (e.g. "Black / M") — shown under the name.
