[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / SynthDirection

# Type Alias: SynthDirection

> **SynthDirection** = `"request"` \| `"response"`

Defined in: [examples/src/index.ts:233](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/examples/src/index.ts#L233)

Direction controls origin handling: a "request" example omits server-`computed` fields a client never sends; a
 "response" example omits `writeOnly` fields. Default "request".
