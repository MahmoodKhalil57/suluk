[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/payments](../README.md) / toForm

# Function: toForm()

> **toForm**(`obj`): `URLSearchParams`

Defined in: [tooling/ts/packages/payments/src/stripe-transport.ts:33](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/stripe-transport.ts#L33)

Stripe's bracket-nested `x-www-form-urlencoded` encoder: objects → `key[k]`, arrays → `key[i]`, scalars appended;
 undefined/null are skipped. Handles the nested arrays checkout/subscription payloads need (`line_items[0][price]`).

## Parameters

### obj

`Record`\<`string`, `unknown`\>

## Returns

`URLSearchParams`
