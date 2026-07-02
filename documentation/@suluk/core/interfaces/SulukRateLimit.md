[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / SulukRateLimit

# Interface: SulukRateLimit

Defined in: [types.ts:430](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L430)

RATE-LIMIT facet shape (saastarter-parity Phase 0): the per-operation rate budget an operation DECLARES.
Orthogonal to the NORMATIVE spec, which holds rate-limiting out-of-scope (C012 / frontier #43, ceiling 0.74):
like `x-suluk-cost`/`access`/`source` this is a vendor extension in the `x-suluk-*` namespace, never a
normative OAS construct. Advisory only — the facet declares the budget; the middleware enforces it.

`windowMs` + `maxRequests` are the fixed-window budget, ported from saastarter's `checkRateLimit` opts
(src/lib/effect/rate-limit.ts:16-19). `key` is the declared key STRATEGY the runtime resolves a concrete
key from: only `"ip"` is saastarter-faithful (it keys by a resolved IP); `"principal"`/`"api-key"`/`"global"`
are ORIGINATED extensions (honestly-low ceiling — `"principal"` keying is gated on the Principal-model
decision, roadmap Open-Decision #5, so the Phase-0 middleware implements only `"ip"` + a caller-supplied override).

## Properties

### description?

> `optional` **description?**: `string`

Defined in: [types.ts:439](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L439)

***

### key

> **key**: `"ip"` \| `"principal"` \| `"api-key"` \| `"global"`

Defined in: [types.ts:436](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L436)

the key STRATEGY (the runtime derives the concrete key). `"ip"` is the faithful default.

***

### maxRequests

> **maxRequests**: `number`

Defined in: [types.ts:434](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L434)

max requests permitted per resolved key within the window.

***

### scope?

> `optional` **scope?**: `string`

Defined in: [types.ts:438](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L438)

optional sub-bucket name — lets two operations share or separate a budget (advisory).

***

### windowMs

> **windowMs**: `number`

Defined in: [types.ts:432](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L432)

fixed window length, milliseconds.
