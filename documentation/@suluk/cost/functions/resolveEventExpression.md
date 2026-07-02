[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cost](../README.md) / resolveEventExpression

# Function: resolveEventExpression()

> **resolveEventExpression**(`expression`, `event`): `string` \| `undefined`

Defined in: [event.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/cost/src/event.ts#L19)

Resolve a C018 runtime-expression against a fired event. Supports `{$event.id}`, `{$event.<key>}`, and a
JSON-Pointer tail `{$event.body#/customer}` / `{$event.body#/data/object/customer}`. Returns the stringified
value, or undefined when it doesn't resolve. Pure; never throws (an unresolvable expression is undefined, not an error).

## Parameters

### expression

`string`

### event

`Record`\<`string`, `unknown`\>

## Returns

`string` \| `undefined`
