[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / Request

# Interface: Request

Defined in: [types.ts:356](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L356)

A Request *is* an operation (SPEC §1.4). DOM handle = its name (the key in `PathItem.requests`);
ADA identity = its signature (C003/C019 Appendix A — computed, not authored).

## Properties

### callbacks?

> `optional` **callbacks?**: `Record`\<`string`, [`Callback`](../type-aliases/Callback.md)\>

Defined in: [types.ts:370](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L370)

***

### contentSchema?

> `optional` **contentSchema?**: [`SchemaOrRef`](../type-aliases/SchemaOrRef.md)

Defined in: [types.ts:366](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L366)

***

### contentType?

> `optional` **contentType?**: `string` \| `string`[]

Defined in: [types.ts:365](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L365)

Request body media type(s) — plain IANA media type; params via the content model (§6/§7).

***

### deprecated?

> `optional` **deprecated?**: `boolean`

Defined in: [types.ts:363](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L363)

***

### description?

> `optional` **description?**: `string`

Defined in: [types.ts:359](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L359)

***

### method

> **method**: [`HttpMethod`](../type-aliases/HttpMethod.md)

Defined in: [types.ts:357](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L357)

***

### operationId?

> `optional` **operationId?**: `string`

Defined in: [types.ts:361](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L361)

Optional legacy handle; not the v4 primary identity (C009).

***

### parameterSchema?

> `optional` **parameterSchema?**: [`ParameterSchema`](ParameterSchema.md)

Defined in: [types.ts:367](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L367)

***

### responses

> **responses**: `Record`\<`string`, [`Response`](Response.md)\>

Defined in: [types.ts:369](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L369)

Named responses (§5); each carries its own status. At least one required.

***

### security?

> `optional` **security?**: [`SecurityRequirement`](../type-aliases/SecurityRequirement.md)[]

Defined in: [types.ts:372](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L372)

Applied security, referenced BY NAME (C014 #69).

***

### servers?

> `optional` **servers?**: [`Server`](Server.md)[]

Defined in: [types.ts:373](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L373)

***

### summary?

> `optional` **summary?**: `string`

Defined in: [types.ts:358](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L358)

***

### tags?

> `optional` **tags?**: `string`[]

Defined in: [types.ts:362](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L362)

***

### x-suluk-approval?

> `optional` **x-suluk-approval?**: [`SulukApproval`](SulukApproval.md)

Defined in: [types.ts:392](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L392)

HUMAN-IN-THE-LOOP APPROVAL facet (Stage 1.4): declares that invoking this operation as an AGENT TOOL requires
human approval before it runs — a consequential/irreversible action an autonomous loop must pause on. Advisory,
like [SulukApproval](SulukApproval.md) describes.

***

### x-suluk-ratelimit?

> `optional` **x-suluk-ratelimit?**: [`SulukRateLimit`](SulukRateLimit.md)

Defined in: [types.ts:386](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L386)

RATE-LIMIT facet (saastarter-parity Phase 0): the declared per-operation rate budget. ADVISORY VENDOR
EXTENSION (see [SulukRateLimit](SulukRateLimit.md)) — @suluk/hono's middleware ENFORCES it on the wire; core only
carries the shape + derived reads (`rateLimitIndex`/`rateLimitCoverage`/`retryAfterSeconds`).

***

### x-suluk-source?

> `optional` **x-suluk-source?**: [`SulukSource`](SulukSource.md)

Defined in: [types.ts:380](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L380)

PROVENANCE facet (council whuovh6gs, L2): where in the AUTHORED source this operation was projected FROM.
A stable SYMBOLIC pointer (file + exported symbol) — never a line number, never an authz/routing input
(advisory only; C022 inv.5). STAMPED by the projection pass, never hand-authored. Scrub from externally
published projections (it discloses internal layout) — see core's `scrubSource` / `sourceIndex`.

***

### x-suluk-store?

> `optional` **x-suluk-store?**: [`SulukStore`](SulukStore.md)

Defined in: [types.ts:401](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L401)

REACTIVE-STORE facet (C037) — `x-suluk-store`. Declares this operation's role in the `@suluk/sdk` reactive client:
a QUERY (`key` present) projects to a `$<key>` store; a MUTATION (`invalidates` present) invalidates those stores
on success. CLIENT-CODEGEN ONLY — a pure hint for the generated frontend layer; NEVER read by the matcher/runtime
(D1; see [SulukStore](SulukStore.md), plan/facts/0reactive.bn + test/store-d1-invariance.test.ts). Target-agnostic: the
default adapter projects to nanostores + @nanostores/query, but the declaration is a dependency graph any reactive
runtime (TanStack Query / SWR / Pinia Colada) can consume — the C034 runtime-adapter-seam move, one layer up.
