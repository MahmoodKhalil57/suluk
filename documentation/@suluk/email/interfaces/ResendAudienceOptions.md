[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/email](../README.md) / ResendAudienceOptions

# Interface: ResendAudienceOptions

Defined in: [audience.ts:48](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/email/src/audience.ts#L48)

## Properties

### apiKey

> **apiKey**: `string`

Defined in: [audience.ts:50](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/email/src/audience.ts#L50)

the Resend API key (the app pulls it from @suluk/env).

***

### fetch?

> `optional` **fetch?**: *typeof* `fetch`

Defined in: [audience.ts:52](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/email/src/audience.ts#L52)

inject a fetch (default: global fetch) — for testing / a custom transport.
