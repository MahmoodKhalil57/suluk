[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/nano-stores](../README.md) / buildUrl

# Function: buildUrl()

> **buildUrl**(`path`, `params?`, `baseUrl?`): `string`

Defined in: [tooling/ts/packages/nano-stores/src/url.ts:12](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/nano-stores/src/url.ts#L12)

URL templating for the STATE corner. A RouteContract.path is Hono-style ("/pet/:petId"); v4 uriTemplates
are RFC-6570 ("pet/{petId}"). buildUrl accepts BOTH param syntaxes so the same helper works whether the
caller hands us a raw contract path or an already-projected v4 template — we substitute ":name" and
"{name}" segments from the params bag, then prepend an optional baseUrl.

Honest-loss discipline (house pattern): a placeholder with no matching param is NOT silently emptied — it
is left verbatim in the URL so the missing binding is visible in the request (and to any test asserting on
the URL), rather than producing a plausible-but-wrong path. Callers that want strictness can diff the
result against a "no `:`/`{` remains" check.

## Parameters

### path

`string`

### params?

`Record`\<`string`, `string` \| `number`\>

### baseUrl?

`string`

## Returns

`string`
