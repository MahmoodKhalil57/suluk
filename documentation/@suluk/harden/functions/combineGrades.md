[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/harden](../README.md) / combineGrades

# Function: combineGrades()

> **combineGrades**(`grades`): [`CombinedGrade`](../interfaces/CombinedGrade.md)

Defined in: [audit.ts:148](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/harden/src/audit.ts#L148)

Combine per-dimension letters into one contract grade (worst + average). Empty ⇒ vacuously A — a caller MUST pass at
 least the doc grade, since gating an empty set passes vacuously (`worst:"A"`).

## Parameters

### grades

[`Grade`](../type-aliases/Grade.md)[]

## Returns

[`CombinedGrade`](../interfaces/CombinedGrade.md)
