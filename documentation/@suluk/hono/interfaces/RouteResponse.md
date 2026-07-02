[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/hono](../README.md) / RouteResponse

# Interface: RouteResponse

Defined in: [tooling/ts/packages/hono/src/contract.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/hono/src/contract.ts#L26)

`@suluk/hono` — the derivation engine. The user authors minimal RouteContracts (Hono + Zod); everything
else is derived: the v4 document (dynamic per principal + time), request validation, contract tests, and
a documentation-coverage audit. See tooling/ARCHITECTURE.md. CANDIDATE tooling.

## Properties

### contentType?

> `optional` **contentType?**: `string`

Defined in: [tooling/ts/packages/hono/src/contract.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/hono/src/contract.ts#L31)

Defaults to application/json when a schema is present.

***

### description?

> `optional` **description?**: `string`

Defined in: [tooling/ts/packages/hono/src/contract.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/hono/src/contract.ts#L28)

***

### examples?

> `optional` **examples?**: `unknown`[]

Defined in: [tooling/ts/packages/hono/src/contract.ts:33](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/hono/src/contract.ts#L33)

Optional concrete example responses — used by contractChecks.

***

### schema?

> `optional` **schema?**: `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>

Defined in: [tooling/ts/packages/hono/src/contract.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/hono/src/contract.ts#L29)

***

### status

> **status**: `number`

Defined in: [tooling/ts/packages/hono/src/contract.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/hono/src/contract.ts#L27)
