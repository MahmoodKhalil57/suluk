[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / isProblemDetails

# Function: isProblemDetails()

> **isProblemDetails**(`body`): `body is ProblemDetails`

Defined in: [errors.ts:107](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/core/src/errors.ts#L107)

Structural guard — discriminates a Problem Details body (parallel to saastarter's `isApiError` and core's
`isReference`). Checks the two always-present RFC-9457 members `title` (string) + `status` (number).

## Parameters

### body

`unknown`

## Returns

`body is ProblemDetails`
