[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/seo](../README.md) / SkewGuardOptions

# Interface: SkewGuardOptions

Defined in: [skew.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/seo/src/skew.ts#L15)

## Properties

### endpoint?

> `optional` **endpoint?**: `string`

Defined in: [skew.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/seo/src/skew.ts#L17)

Endpoint that echoes the current deployment id in the header (default "/api/health").

***

### header?

> `optional` **header?**: `string`

Defined in: [skew.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/seo/src/skew.ts#L19)

Response header carrying the id (default "x-deployment-id").

***

### intervalMs?

> `optional` **intervalMs?**: `number`

Defined in: [skew.ts:21](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/seo/src/skew.ts#L21)

Poll interval ms (default 60000).
