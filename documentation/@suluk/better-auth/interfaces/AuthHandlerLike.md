[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / AuthHandlerLike

# Interface: AuthHandlerLike

Defined in: [mount.ts:7](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/better-auth/src/mount.ts#L7)

mountAuth — the thin Hono adapter for Better Auth (the documented integration:
app.on(["POST","GET"], "/api/auth/*", c => auth.handler(c.req.raw))). Duck-typed so it needs neither a
hard better-auth nor hono import — it only relies on app.on(...) and auth.handler(Request).

## Methods

### handler()

> **handler**(`request`): `Response` \| `Promise`\<`Response`\>

Defined in: [mount.ts:8](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/better-auth/src/mount.ts#L8)

#### Parameters

##### request

`Request`

#### Returns

`Response` \| `Promise`\<`Response`\>
