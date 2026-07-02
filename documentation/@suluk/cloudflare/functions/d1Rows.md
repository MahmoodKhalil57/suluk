[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / d1Rows

# Function: d1Rows()

> **d1Rows**(`result`): `Record`\<`string`, `unknown`\>[]

Defined in: [tooling/ts/packages/cloudflare/src/resources.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/cloudflare/src/resources.ts#L29)

Rows from a D1 query response — the API returns `[{ results, success, meta }]` (one per statement); take the last.

## Parameters

### result

`unknown`

## Returns

`Record`\<`string`, `unknown`\>[]
