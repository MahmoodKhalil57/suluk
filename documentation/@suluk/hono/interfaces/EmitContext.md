[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/hono](../README.md) / EmitContext

# Interface: EmitContext

Defined in: [tooling/ts/packages/hono/src/emit.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/hono/src/emit.ts#L15)

## Properties

### includeDeprecated?

> `optional` **includeDeprecated?**: `boolean`

Defined in: [tooling/ts/packages/hono/src/emit.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/hono/src/emit.ts#L27)

Include operations flagged deprecated (default true; they are marked, not hidden).

***

### info?

> `optional` **info?**: `Partial`\<[`Info`](../../core/interfaces/Info.md)\>

Defined in: [tooling/ts/packages/hono/src/emit.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/hono/src/emit.ts#L16)

***

### now?

> `optional` **now?**: `string` \| `Date`

Defined in: [tooling/ts/packages/hono/src/emit.ts:21](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/hono/src/emit.ts#L21)

The "when": ISO date / Date. Drives deprecatedSince + removedSince. Omit ⇒ no time filtering.

***

### principal?

> `optional` **principal?**: `object`

Defined in: [tooling/ts/packages/hono/src/emit.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/hono/src/emit.ts#L19)

The "who": include only operations whose required scopes the principal holds. Omit ⇒ full public doc.

#### scopes?

> `optional` **scopes?**: `string`[]

***

### securityScheme?

> `optional` **securityScheme?**: `string`

Defined in: [tooling/ts/packages/hono/src/emit.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/hono/src/emit.ts#L23)

Name of the security scheme that `scopes` map onto (e.g. "bearerAuth"). Enables scopes→security.

***

### securitySchemes?

> `optional` **securitySchemes?**: `Record`\<`string`, [`SecurityScheme`](../../core/interfaces/SecurityScheme.md)\>

Defined in: [tooling/ts/packages/hono/src/emit.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/hono/src/emit.ts#L25)

Declared security schemes for components (C014).

***

### servers?

> `optional` **servers?**: [`Server`](../../core/interfaces/Server.md)[]

Defined in: [tooling/ts/packages/hono/src/emit.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/hono/src/emit.ts#L17)

***

### synthesizeErrors?

> `optional` **synthesizeErrors?**: `boolean`

Defined in: [tooling/ts/packages/hono/src/emit.ts:33](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/hono/src/emit.ts#L33)

Synthesize RFC-9457 error responses (401/403 from access, 429 from a rate-limit facet, always-500, plus any
`route.errors`) + a shared `components.schemas.ProblemDetails`. Default true — the SDK's `isApiError` guard and
testgen's error-conformance need declared non-2xx responses to check. Set false for a success-only projection.
