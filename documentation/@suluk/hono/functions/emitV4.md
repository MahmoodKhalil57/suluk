[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/hono](../README.md) / emitV4

# Function: emitV4()

> **emitV4**(`routes`, `ctx?`): [`EmitResult`](../interfaces/EmitResult.md)

Defined in: [tooling/ts/packages/hono/src/emit.ts:154](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/hono/src/emit.ts#L154)

Project a list of route contracts into a v4 document for a given principal + time.
- WHEN: removedSince ≤ now ⇒ hidden; deprecatedSince ≤ now ⇒ marked deprecated.
- WHO: if a principal is supplied, an operation requiring scopes the principal lacks is omitted.

## Parameters

### routes

readonly [`RouteContract`](../interfaces/RouteContract.md)[]

### ctx?

[`EmitContext`](../interfaces/EmitContext.md) = `{}`

## Returns

[`EmitResult`](../interfaces/EmitResult.md)
