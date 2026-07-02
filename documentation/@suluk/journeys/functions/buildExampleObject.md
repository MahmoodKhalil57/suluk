[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / buildExampleObject

# Function: buildExampleObject()

> **buildExampleObject**(`headers`, `row`, `bodySchema?`): `Record`\<`string`, `unknown`\>

Defined in: [journeys/src/promote.ts:56](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/journeys/src/promote.ts#L56)

Build a concrete public example object from a row, coercing by the body schema's field types. A WIRING TOKEN cell
(`<op.select>`) is skipped — a public docs example holds concrete values, not a chaining instruction.

## Parameters

### headers

`string`[]

### row

`string`[]

### bodySchema?

[`JsonSchema`](../type-aliases/JsonSchema.md)

## Returns

`Record`\<`string`, `unknown`\>
