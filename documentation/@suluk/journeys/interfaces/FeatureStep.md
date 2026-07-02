[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / FeatureStep

# Interface: FeatureStep

Defined in: [journeys/src/gherkin.ts:11](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/journeys/src/gherkin.ts#L11)

## Properties

### kind

> **kind**: `StepKind`

Defined in: [journeys/src/gherkin.ts:13](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/journeys/src/gherkin.ts#L13)

the RESOLVED keyword (And/But fold into the preceding Given/When/Then).

***

### line

> **line**: `number`

Defined in: [journeys/src/gherkin.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/journeys/src/gherkin.ts#L19)

1-based source line number (for file:line hand-offs).

***

### raw

> **raw**: `string`

Defined in: [journeys/src/gherkin.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/journeys/src/gherkin.ts#L17)

the raw line as written (for reporting).

***

### text

> **text**: `string`

Defined in: [journeys/src/gherkin.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/journeys/src/gherkin.ts#L15)

the step text after the keyword.
