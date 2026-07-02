[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / RenderOptions

# Interface: RenderOptions

Defined in: [journeys/src/demos.ts:154](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/journeys/src/demos.ts#L154)

## Properties

### baseUrl?

> `optional` **baseUrl?**: `string`

Defined in: [journeys/src/demos.ts:158](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/journeys/src/demos.ts#L158)

the PROD base URL — the live-call target the tester switches to.

***

### localBaseUrl?

> `optional` **localBaseUrl?**: `string`

Defined in: [journeys/src/demos.ts:161](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/journeys/src/demos.ts#L161)

the LOCAL base URL a developer tests against FIRST (the same collection, just a different `baseUrl`). Default a
 Cloudflare Workers `wrangler dev` port.

***

### name?

> `optional` **name?**: `string`

Defined in: [journeys/src/demos.ts:156](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/journeys/src/demos.ts#L156)

collection name (default the doc/feature title or "Demo").
