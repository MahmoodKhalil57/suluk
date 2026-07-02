[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / Scenario

# Interface: Scenario

Defined in: [journeys/src/gherkin.ts:22](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/journeys/src/gherkin.ts#L22)

## Properties

### examples?

> `optional` **examples?**: `object`

Defined in: [journeys/src/gherkin.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/journeys/src/gherkin.ts#L32)

the captured `Examples:` table of a Scenario Outline (C040-P1); absent for a plain Scenario. `tags` are from a
 `@public`-style line directly above the `Examples:` keyword (C040-P4 promote selection).

#### headers

> **headers**: `string`[]

#### rows

> **rows**: `string`[][]

#### tags?

> `optional` **tags?**: `string`[]

***

### line

> **line**: `number`

Defined in: [journeys/src/gherkin.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/journeys/src/gherkin.ts#L27)

***

### name

> **name**: `string`

Defined in: [journeys/src/gherkin.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/journeys/src/gherkin.ts#L23)

***

### rule?

> `optional` **rule?**: `string`

Defined in: [journeys/src/gherkin.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/journeys/src/gherkin.ts#L25)

the `Rule:` this scenario sits under, if any.

***

### steps

> **steps**: [`FeatureStep`](FeatureStep.md)[]

Defined in: [journeys/src/gherkin.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/journeys/src/gherkin.ts#L26)

***

### tags?

> `optional` **tags?**: `string`[]

Defined in: [journeys/src/gherkin.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/journeys/src/gherkin.ts#L29)

tags on this scenario (the leading `@` stripped), e.g. ["public"].
