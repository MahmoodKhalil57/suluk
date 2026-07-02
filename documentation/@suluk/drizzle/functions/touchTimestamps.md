[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / touchTimestamps

# Function: touchTimestamps()

> **touchTimestamps**(`opts?`, `creating?`, `now?`): `Record`\<`string`, `string`\>

Defined in: [mutations.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/drizzle/src/mutations.ts#L31)

The patch server-managed timestamps apply on write — `updatedAt` always, `createdAt` only when `creating`.

## Parameters

### opts?

[`TimestampOptions`](../interfaces/TimestampOptions.md) = `{}`

### creating?

`boolean` = `false`

### now?

`Date` = `...`

## Returns

`Record`\<`string`, `string`\>
