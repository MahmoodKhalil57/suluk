[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/harden](../README.md) / combineGrades

# Function: combineGrades()

> **combineGrades**(`grades`): [`CombinedGrade`](../interfaces/CombinedGrade.md)

Defined in: [audit.ts:148](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/harden/src/audit.ts#L148)

Combine per-dimension letters into one contract grade (worst + average). Empty ⇒ vacuously A — a caller MUST pass at
 least the doc grade, since gating an empty set passes vacuously (`worst:"A"`).

## Parameters

### grades

[`Grade`](../type-aliases/Grade.md)[]

## Returns

[`CombinedGrade`](../interfaces/CombinedGrade.md)
