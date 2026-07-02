[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/hono](../README.md) / RouteRequest

# Interface: RouteRequest

Defined in: [tooling/ts/packages/hono/src/contract.ts:11](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/hono/src/contract.ts#L11)

`@suluk/hono` — the derivation engine. The user authors minimal RouteContracts (Hono + Zod); everything
else is derived: the v4 document (dynamic per principal + time), request validation, contract tests, and
a documentation-coverage audit. See tooling/ARCHITECTURE.md. CANDIDATE tooling.

## Properties

### contentType?

> `optional` **contentType?**: `string`

Defined in: [tooling/ts/packages/hono/src/contract.ts:21](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/hono/src/contract.ts#L21)

Override the body media type.

***

### examples?

> `optional` **examples?**: `unknown`[]

Defined in: [tooling/ts/packages/hono/src/contract.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/hono/src/contract.ts#L23)

Optional concrete example bodies — used by contractChecks to assert example⊨schema.

***

### header?

> `optional` **header?**: `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>

Defined in: [tooling/ts/packages/hono/src/contract.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/hono/src/contract.ts#L17)

Request headers that participate in the contract, as a Zod object.

***

### json?

> `optional` **json?**: `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>

Defined in: [tooling/ts/packages/hono/src/contract.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/hono/src/contract.ts#L19)

Request body (defaults to application/json).

***

### params?

> `optional` **params?**: `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>

Defined in: [tooling/ts/packages/hono/src/contract.ts:13](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/hono/src/contract.ts#L13)

Path params (Hono `:name`), as a Zod object.

***

### query?

> `optional` **query?**: `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>

Defined in: [tooling/ts/packages/hono/src/contract.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/hono/src/contract.ts#L15)

Query string, as a Zod object.
