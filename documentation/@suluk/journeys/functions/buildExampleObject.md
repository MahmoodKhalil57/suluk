[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / buildExampleObject

# Function: buildExampleObject()

> **buildExampleObject**(`headers`, `row`, `bodySchema?`): `Record`\<`string`, `unknown`\>

Defined in: [journeys/src/promote.ts:56](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/journeys/src/promote.ts#L56)

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
