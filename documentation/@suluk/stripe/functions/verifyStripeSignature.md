[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/stripe](../README.md) / verifyStripeSignature

# Function: verifyStripeSignature()

> **verifyStripeSignature**(`rawBody`, `sigHeader`, `secret`, `opts?`): `Promise`\<`boolean`\>

Defined in: [stripe-webhook.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/payments/src/stripe-webhook.ts#L30)

Verify a Stripe `stripe-signature` header against the raw request body + the endpoint signing secret. Returns true iff
a v1 signature matches the HMAC of `${t}.${rawBody}` AND the timestamp is within tolerance. Pass the RAW (unparsed)
body — re-serializing JSON changes the bytes and breaks the HMAC.

## Parameters

### rawBody

`string`

### sigHeader

`string`

### secret

`string`

### opts?

[`VerifyOptions`](../interfaces/VerifyOptions.md) = `{}`

## Returns

`Promise`\<`boolean`\>
