[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / SulukJob

# Interface: SulukJob

Defined in: [types.ts:143](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/core/src/types.ts#L143)

A background job (C025) — non-HTTP work fired by a `scheduled` (cron) or `queue-consumed` trigger. It carries no
Request/Response (there is no HTTP exchange); its STATIC fields (trigger + schedule/queue) are locally decidable,
and it carries the same advisory `x-suluk-*` facets an operation does (notably `x-suluk-cost` with a matching
`trigger`, so a job's cost is declared + audited like any other). Provenance via `x-suluk-source`.

## Indexable

> \[`ext`: `` `x-${string}` ``\]: `unknown`

any other vendor facet — notably `x-suluk-cost` (the job's declared cost, read by @suluk/cost).

## Properties

### description?

> `optional` **description?**: `string`

Defined in: [types.ts:151](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/core/src/types.ts#L151)

***

### queue?

> `optional` **queue?**: `string`

Defined in: [types.ts:149](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/core/src/types.ts#L149)

for "queue-consumed": the queue name the consumer drains.

***

### schedule?

> `optional` **schedule?**: `string`

Defined in: [types.ts:147](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/core/src/types.ts#L147)

for "scheduled": a cron expression (statically declared — e.g. "0 0 * * *").

***

### summary?

> `optional` **summary?**: `string`

Defined in: [types.ts:150](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/core/src/types.ts#L150)

***

### trigger

> **trigger**: `"scheduled"` \| `"queue-consumed"`

Defined in: [types.ts:145](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/core/src/types.ts#L145)

the non-HTTP trigger that fires this job.

***

### x-suluk-source?

> `optional` **x-suluk-source?**: [`SulukSource`](SulukSource.md)

Defined in: [types.ts:153](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/core/src/types.ts#L153)

where in the authored source this job was projected from (advisory provenance; mirrors Request).
