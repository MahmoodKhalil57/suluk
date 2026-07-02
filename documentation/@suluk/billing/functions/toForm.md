[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / toForm

# Function: toForm()

> **toForm**(`obj`): `URLSearchParams`

Defined in: [packages/payments/src/stripe-transport.ts:33](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/payments/src/stripe-transport.ts#L33)

Stripe's bracket-nested `x-www-form-urlencoded` encoder: objects → `key[k]`, arrays → `key[i]`, scalars appended;
 undefined/null are skipped. Handles the nested arrays checkout/subscription payloads need (`line_items[0][price]`).

## Parameters

### obj

`Record`\<`string`, `unknown`\>

## Returns

`URLSearchParams`
