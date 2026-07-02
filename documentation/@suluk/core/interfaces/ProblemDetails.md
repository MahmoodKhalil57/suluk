[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / ProblemDetails

# Interface: ProblemDetails

Defined in: [errors.ts:69](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/core/src/errors.ts#L69)

An RFC-9457 Problem Details object. `type` is the machine identifier (a URI reference; default `"about:blank"`),
`title` is human-readable, `status` is the HTTP status. `detail` is the human explanation; `errors` carries
structured validation details (what saastarter put in `details`). `error` is a LEGACY machine-code member kept
for Phase 0 (the existing SDK + the @suluk/hono `deny()` body read it) — deprecated in favor of `type`/`detail`.

## Indexable

> \[`ext`: `` `x-${string}` ``\]: `unknown`

## Properties

### detail?

> `optional` **detail?**: `string`

Defined in: [errors.ts:73](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/core/src/errors.ts#L73)

***

### ~~error?~~

> `optional` **error?**: `string`

Defined in: [errors.ts:78](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/core/src/errors.ts#L78)

#### Deprecated

legacy machine code (Phase-0 bridge); prefer `type`/`detail`.

***

### errors?

> `optional` **errors?**: `Record`\<`string`, `unknown`\>

Defined in: [errors.ts:76](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/core/src/errors.ts#L76)

structured validation errors (saastarter's `details`).

***

### instance?

> `optional` **instance?**: `string`

Defined in: [errors.ts:74](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/core/src/errors.ts#L74)

***

### status

> **status**: [`ProblemStatus`](../type-aliases/ProblemStatus.md)

Defined in: [errors.ts:72](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/core/src/errors.ts#L72)

***

### title

> **title**: `string`

Defined in: [errors.ts:71](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/core/src/errors.ts#L71)

***

### type

> **type**: `string`

Defined in: [errors.ts:70](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/core/src/errors.ts#L70)
