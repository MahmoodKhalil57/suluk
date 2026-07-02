[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / optsType

# Function: optsType()

> **optsType**\<`T`\>(): [`Schema`](../interfaces/Schema.md)\<`T`\>

Defined in: [service.ts:158](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/platform/src/service.ts#L158)

A TYPED opts marker for a service's `serviceOpts`/`brandOpts`. Phase 2 uses it purely for TYPES — the manifest author
gets autocomplete + type-checking on that service's opts. It carries the value type `T` in the `Schema<T>` slot; Phase 3
swaps it for a runtime-validating zod schema of the SAME type (a drop-in — the field type is `Schema<T>` either way).

## Type Parameters

### T

`T`

## Returns

[`Schema`](../interfaces/Schema.md)\<`T`\>
