[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / promoteExampleIntoZod

# Function: promoteExampleIntoZod()

> **promoteExampleIntoZod**(`source`, `schemaVar`, `example`, `provenance`): [`PromoteResult`](../interfaces/PromoteResult.md)

Defined in: [journeys/src/promote.ts:151](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/journeys/src/promote.ts#L151)

Promote `example` into the source of the Zod schema bound to `const <schemaVar> = …`. Idempotent (re-promote replaces
the marked block), marked, and refuses to clobber a hand-authored top-level `.meta({ examples })`.

## Parameters

### source

`string`

### schemaVar

`string`

### example

`unknown`

### provenance

`string`

## Returns

[`PromoteResult`](../interfaces/PromoteResult.md)
