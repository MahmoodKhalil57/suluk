[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/email](../README.md) / resendProvider

# Function: resendProvider()

> **resendProvider**(`opts`): [`EmailProvider`](../interfaces/EmailProvider.md)

Defined in: [provider.ts:107](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/email/src/provider.ts#L107)

Resend binding via the REST API (https://api.resend.com/emails) over `fetch` — Workers-safe, no `resend` SDK.
Returns `{ ok:false, error }` on a non-2xx or a transport error (the caller decides whether a send failure is
fatal); never throws.

## Parameters

### opts

[`ResendProviderOptions`](../interfaces/ResendProviderOptions.md)

## Returns

[`EmailProvider`](../interfaces/EmailProvider.md)
