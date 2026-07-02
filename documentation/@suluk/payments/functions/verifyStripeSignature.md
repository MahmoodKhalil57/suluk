[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/payments](../README.md) / verifyStripeSignature

# Function: verifyStripeSignature()

> **verifyStripeSignature**(`rawBody`, `sigHeader`, `secret`, `opts?`): `Promise`\<`boolean`\>

Defined in: [tooling/ts/packages/payments/src/stripe-webhook.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/payments/src/stripe-webhook.ts#L30)

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
