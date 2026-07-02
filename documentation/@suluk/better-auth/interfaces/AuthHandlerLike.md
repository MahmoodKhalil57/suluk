[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / AuthHandlerLike

# Interface: AuthHandlerLike

Defined in: [mount.ts:7](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/better-auth/src/mount.ts#L7)

mountAuth — the thin Hono adapter for Better Auth (the documented integration:
app.on(["POST","GET"], "/api/auth/*", c => auth.handler(c.req.raw))). Duck-typed so it needs neither a
hard better-auth nor hono import — it only relies on app.on(...) and auth.handler(Request).

## Methods

### handler()

> **handler**(`request`): `Response` \| `Promise`\<`Response`\>

Defined in: [mount.ts:8](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/better-auth/src/mount.ts#L8)

#### Parameters

##### request

`Request`

#### Returns

`Response` \| `Promise`\<`Response`\>
