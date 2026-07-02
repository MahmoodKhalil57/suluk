[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/hono](../README.md) / EnforceAccessConfig

# Interface: EnforceAccessConfig

Defined in: [tooling/ts/packages/hono/src/enforce.ts:50](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/hono/src/enforce.ts#L50)

Read identity from a request — the app supplies these (it owns its principal/scope model).

## Extends

- [`IdentityConfig`](IdentityConfig.md)

## Properties

### accessOf

> **accessOf**: (`operation`) => [`AccessFacet`](AccessFacet.md) \| `undefined`

Defined in: [tooling/ts/packages/hono/src/enforce.ts:54](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/hono/src/enforce.ts#L54)

the declared access facet for an operation (e.g. from the document's x-suluk-access).

#### Parameters

##### operation

`string`

#### Returns

[`AccessFacet`](AccessFacet.md) \| `undefined`

***

### defaultRequires?

> `optional` **defaultRequires?**: [`AccessRequires`](../type-aliases/AccessRequires.md)

Defined in: [tooling/ts/packages/hono/src/enforce.ts:60](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/hono/src/enforce.ts#L60)

what an operation that declares NO access facet requires. Defaults to "authenticated" — DENY BY DEFAULT, so a
dropped/missing facet is a 401 in tests, NEVER a silent public route (a fail-open default is how an annotation
gap becomes a live breach). Mark genuinely-public ops explicitly `requires:"anyone"`.

***

### isAdmin?

> `optional` **isAdmin?**: (`c`) => `boolean`

Defined in: [tooling/ts/packages/hono/src/enforce.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/hono/src/enforce.ts#L32)

fast-path admin check (verified). If omitted, the literal "admin" scope is used.

#### Parameters

##### c

`Context`

#### Returns

`boolean`

#### Inherited from

[`IdentityConfig`](IdentityConfig.md).[`isAdmin`](IdentityConfig.md#isadmin)

***

### operationOf

> **operationOf**: (`c`) => `string` \| `undefined`

Defined in: [tooling/ts/packages/hono/src/enforce.ts:52](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/hono/src/enforce.ts#L52)

the operation name for this request, or undefined for non-contract paths (static/auth/docs → allowed).

#### Parameters

##### c

`Context`

#### Returns

`string` \| `undefined`

***

### principal

> **principal**: (`c`) => `string` \| `null` \| `undefined`

Defined in: [tooling/ts/packages/hono/src/enforce.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/hono/src/enforce.ts#L30)

the caller's verified principal id, or null/undefined for anonymous.

#### Parameters

##### c

`Context`

#### Returns

`string` \| `null` \| `undefined`

#### Inherited from

[`IdentityConfig`](IdentityConfig.md).[`principal`](IdentityConfig.md#principal)

***

### scopes?

> `optional` **scopes?**: (`c`) => `string`[] \| `undefined`

Defined in: [tooling/ts/packages/hono/src/enforce.ts:34](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/hono/src/enforce.ts#L34)

the caller's granted scopes (e.g. ["admin"], ["org:1:read"]). Default: none.

#### Parameters

##### c

`Context`

#### Returns

`string`[] \| `undefined`

#### Inherited from

[`IdentityConfig`](IdentityConfig.md).[`scopes`](IdentityConfig.md#scopes)
