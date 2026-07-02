[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / SulukStore

# Interface: SulukStore

Defined in: [types.ts:110](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/core/src/types.ts#L110)

A REACTIVE-STORE declaration (C037) — the per-operation `x-suluk-store` facet. The contract's statement of how the
frontend should turn this operation into reactive state, so the `@suluk/sdk` generator can emit a ready-to-use
reactive client (states + events + callbacks) instead of every consumer hand-wiring stores + invalidation. A QUERY
(read) BACKS a store; a MUTATION (write) INVALIDATES stores on success. `key` (query) and `invalidates` (mutation)
are DISJOINT roles — presence-of-`key` discriminates query-vs-mutation, mirroring C027's presence-of-`model`
skill-vs-route discriminator. CLIENT-CODEGEN ONLY: the reactive layer reads it; the matcher/runtime NEVER do. Every
field names author-chosen STORE names or param NAMES — NEVER a request/header/body/query VALUE — so nothing here can
leak into a request selector (D1 safe; see plan/facts/0reactive.bn + test/store-d1-invariance.test.ts). Structural.

## Indexable

> \[`ext`: `` `x-${string}` ``\]: `unknown`

## Properties

### invalidates?

> `optional` **invalidates?**: `string`[]

Defined in: [types.ts:120](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/core/src/types.ts#L120)

MUTATION role: the store `key`s this operation invalidates on a successful (2xx) response → the generated client refetches them.

***

### key?

> `optional` **key?**: `string`

Defined in: [types.ts:112](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/core/src/types.ts#L112)

QUERY role: the stable store name the generator projects to a `$<key>` reactive store (C009 by-name identity).

***

### onSuccess?

> `optional` **onSuccess?**: `string`

Defined in: [types.ts:122](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/core/src/types.ts#L122)

the success message the callback layer surfaces on a 2xx (advisory; the renderer is INJECTED, the text is DECLARED).

***

### params?

> `optional` **params?**: `string`[]

Defined in: [types.ts:118](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/core/src/types.ts#L118)

QUERY role: the path/query PARAM NAMES (never values) that key a parameterized store family — one store per distinct arg tuple.

***

### revalidateOnFocus?

> `optional` **revalidateOnFocus?**: `boolean`

Defined in: [types.ts:116](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/core/src/types.ts#L116)

QUERY role: revalidate the store when the window/tab regains focus (default false).

***

### ttl?

> `optional` **ttl?**: `number`

Defined in: [types.ts:114](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/core/src/types.ts#L114)

QUERY role: cache lifetime in SECONDS before the store revalidates (the generator's cacheLifetime hint).
