[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/hono](../README.md) / RouteContract

# Interface: RouteContract

Defined in: [tooling/ts/packages/hono/src/contract.ts:36](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/hono/src/contract.ts#L36)

`@suluk/hono` — the derivation engine. The user authors minimal RouteContracts (Hono + Zod); everything
else is derived: the v4 document (dynamic per principal + time), request validation, contract tests, and
a documentation-coverage audit. See tooling/ARCHITECTURE.md. CANDIDATE tooling.

## Properties

### deprecated?

> `optional` **deprecated?**: `boolean`

Defined in: [tooling/ts/packages/hono/src/contract.ts:45](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/hono/src/contract.ts#L45)

***

### deprecatedSince?

> `optional` **deprecatedSince?**: `string`

Defined in: [tooling/ts/packages/hono/src/contract.ts:47](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/hono/src/contract.ts#L47)

ISO date; with EmitContext.now, the operation is marked deprecated once now ≥ this.

***

### description?

> `optional` **description?**: `string`

Defined in: [tooling/ts/packages/hono/src/contract.ts:43](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/hono/src/contract.ts#L43)

***

### errors?

> `optional` **errors?**: `number`[]

Defined in: [tooling/ts/packages/hono/src/contract.ts:58](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/hono/src/contract.ts#L58)

Error statuses this operation can return. Synthesized into RFC-9457 error responses by emitV4 (alongside
the auto-derived 401/403 for auth-gated ops, 429 when rate-limited, and an always-present 500).

***

### handler?

> `optional` **handler?**: (`c`) => `unknown`

Defined in: [tooling/ts/packages/hono/src/contract.ts:68](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/hono/src/contract.ts#L68)

Optional live handler, used only by mount().

#### Parameters

##### c

`unknown`

#### Returns

`unknown`

***

### method

> **method**: [`Method`](../type-aliases/Method.md)

Defined in: [tooling/ts/packages/hono/src/contract.ts:37](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/hono/src/contract.ts#L37)

***

### name?

> `optional` **name?**: `string`

Defined in: [tooling/ts/packages/hono/src/contract.ts:41](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/hono/src/contract.ts#L41)

The operation's v4 by-name handle (C009). Derived from method+path if omitted.

***

### path

> **path**: `string`

Defined in: [tooling/ts/packages/hono/src/contract.ts:39](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/hono/src/contract.ts#L39)

Hono-style path, e.g. "/pet/:petId" or "/files/*". Converted to a v4 uriTemplate on emit.

***

### rateLimit?

> `optional` **rateLimit?**: [`SulukRateLimit`](../../core/interfaces/SulukRateLimit.md)

Defined in: [tooling/ts/packages/hono/src/contract.ts:63](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/hono/src/contract.ts#L63)

The declared rate budget (the `x-suluk-ratelimit` facet). emitV4 stamps it onto the operation + synthesizes a
429 response; @suluk/hono's enforceRateLimit middleware ENFORCES it on the wire. Advisory vendor extension.

***

### removedSince?

> `optional` **removedSince?**: `string`

Defined in: [tooling/ts/packages/hono/src/contract.ts:49](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/hono/src/contract.ts#L49)

ISO date; with EmitContext.now, the operation is HIDDEN once now ≥ this (the "when" axis).

***

### request?

> `optional` **request?**: [`RouteRequest`](RouteRequest.md)

Defined in: [tooling/ts/packages/hono/src/contract.ts:64](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/hono/src/contract.ts#L64)

***

### responses?

> `optional` **responses?**: [`RouteResponse`](RouteResponse.md)[] \| `Record`\<`string`, [`RouteResponse`](RouteResponse.md)\>

Defined in: [tooling/ts/packages/hono/src/contract.ts:66](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/hono/src/contract.ts#L66)

Responses, as a list (each carries its own status) or a status-keyed map.

***

### scopes?

> `optional` **scopes?**: `string`[]

Defined in: [tooling/ts/packages/hono/src/contract.ts:53](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/hono/src/contract.ts#L53)

Required scopes. Drives BOTH the per-principal filter (the "who") and synthesized security.

***

### security?

> `optional` **security?**: [`SecurityRequirement`](../../core/type-aliases/SecurityRequirement.md)[]

Defined in: [tooling/ts/packages/hono/src/contract.ts:51](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/hono/src/contract.ts#L51)

Explicit by-name security requirements (C014).

***

### summary?

> `optional` **summary?**: `string`

Defined in: [tooling/ts/packages/hono/src/contract.ts:42](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/hono/src/contract.ts#L42)

***

### tags?

> `optional` **tags?**: `string`[]

Defined in: [tooling/ts/packages/hono/src/contract.ts:44](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/hono/src/contract.ts#L44)
