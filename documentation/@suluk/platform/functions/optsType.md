[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / optsType

# Function: optsType()

> **optsType**\<`T`\>(): [`Schema`](../interfaces/Schema.md)\<`T`\>

Defined in: [service.ts:134](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/service.ts#L134)

A TYPED opts marker for a service's `serviceOpts`/`brandOpts`. Phase 2 uses it purely for TYPES — the manifest author
gets autocomplete + type-checking on that service's opts. It carries the value type `T` in the `Schema<T>` slot; Phase 3
swaps it for a runtime-validating zod schema of the SAME type (a drop-in — the field type is `Schema<T>` either way).

## Type Parameters

### T

`T`

## Returns

[`Schema`](../interfaces/Schema.md)\<`T`\>
