[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/email](../README.md) / ResendAudienceOptions

# Interface: ResendAudienceOptions

Defined in: [audience.ts:48](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/email/src/audience.ts#L48)

## Properties

### apiKey

> **apiKey**: `string`

Defined in: [audience.ts:50](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/email/src/audience.ts#L50)

the Resend API key (the app pulls it from @suluk/env).

***

### fetch?

> `optional` **fetch?**: *typeof* `fetch`

Defined in: [audience.ts:52](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/email/src/audience.ts#L52)

inject a fetch (default: global fetch) — for testing / a custom transport.
