[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/email](../README.md) / ResendAudienceOptions

# Interface: ResendAudienceOptions

Defined in: [audience.ts:48](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/email/src/audience.ts#L48)

## Properties

### apiKey

> **apiKey**: `string`

Defined in: [audience.ts:50](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/email/src/audience.ts#L50)

the Resend API key (the app pulls it from @suluk/env).

***

### fetch?

> `optional` **fetch?**: *typeof* `fetch`

Defined in: [audience.ts:52](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/email/src/audience.ts#L52)

inject a fetch (default: global fetch) — for testing / a custom transport.
