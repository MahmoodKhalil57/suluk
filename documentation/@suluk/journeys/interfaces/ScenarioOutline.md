[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / ScenarioOutline

# Interface: ScenarioOutline

Defined in: [journeys/src/outline.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/journeys/src/outline.ts#L23)

## Properties

### columns

> **columns**: [`OutlineColumn`](OutlineColumn.md)[]

Defined in: [journeys/src/outline.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/journeys/src/outline.ts#L31)

client-facing input columns (computed fields dropped). Empty ⇒ a plain Scenario, no Examples table.

***

### method

> **method**: `string`

Defined in: [journeys/src/outline.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/journeys/src/outline.ts#L26)

***

### op

> **op**: `string`

Defined in: [journeys/src/outline.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/journeys/src/outline.ts#L25)

the operation's v4 by-name handle.

***

### uri

> **uri**: `string`

Defined in: [journeys/src/outline.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/journeys/src/outline.ts#L27)

***

### whenPhrase

> **whenPhrase**: `string`

Defined in: [journeys/src/outline.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/journeys/src/outline.ts#L29)

the `When` step text (placeholders reference the Examples columns).
