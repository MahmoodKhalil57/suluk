[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / SynthDirection

# Type Alias: SynthDirection

> **SynthDirection** = `"request"` \| `"response"`

Defined in: [examples/src/index.ts:233](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/examples/src/index.ts#L233)

Direction controls origin handling: a "request" example omits server-`computed` fields a client never sends; a
 "response" example omits `writeOnly` fields. Default "request".
