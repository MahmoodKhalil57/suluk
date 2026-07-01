[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / toProblemDetails

# Function: toProblemDetails()

> **toProblemDetails**(`args`): [`ProblemDetails`](../interfaces/ProblemDetails.md)

Defined in: [errors.ts:122](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/core/src/errors.ts#L122)

Pure constructor: a tag (+ optional detail/instance/errors/type) → the canonical Problem Details body.
Fills `status` + `title` from the frozen tables and a stable legacy `error` code. No I/O, no throwing.

## Parameters

### args

#### detail?

`string`

#### errors?

`Record`\<`string`, `unknown`\>

#### instance?

`string`

#### tag

[`ErrorTag`](../type-aliases/ErrorTag.md)

#### type?

`string`

## Returns

[`ProblemDetails`](../interfaces/ProblemDetails.md)
