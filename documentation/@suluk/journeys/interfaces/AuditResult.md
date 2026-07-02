[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / AuditResult

# Interface: AuditResult

Defined in: [journeys/src/cli.ts:135](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/journeys/src/cli.ts#L135)

## Properties

### combined

> **combined**: `object`

Defined in: [journeys/src/cli.ts:143](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/journeys/src/cli.ts#L143)

the combined grade (worst is the safe value to gate on).

#### average

> **average**: [`Grade`](../../harden/type-aliases/Grade.md)

#### grades

> **grades**: [`Grade`](../../harden/type-aliases/Grade.md)[]

#### worst

> **worst**: [`Grade`](../../harden/type-aliases/Grade.md)

***

### coverage?

> `optional` **coverage?**: [`CoverageGrade`](CoverageGrade.md)

Defined in: [journeys/src/cli.ts:141](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/journeys/src/cli.ts#L141)

BDD contract coverage — present only when `.feature` files were given.

***

### readiness

> **readiness**: [`DimensionAudit`](DimensionAudit.md)

Defined in: [journeys/src/cli.ts:139](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/journeys/src/cli.ts#L139)

schema-fact readiness (computed-required / missing-example) — `@suluk/harden` auditReadiness.

***

### security

> **security**: [`DimensionAudit`](DimensionAudit.md)

Defined in: [journeys/src/cli.ts:137](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/journeys/src/cli.ts#L137)

schema input-hardening (security) — `@suluk/harden` auditDocument.
