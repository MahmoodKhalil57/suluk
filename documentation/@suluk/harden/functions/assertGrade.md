[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/harden](../README.md) / assertGrade

# Function: assertGrade()

> **assertGrade**(`doc`, `min`, `opts?`): [`DocAudit`](../interfaces/DocAudit.md)

Defined in: [audit.ts:120](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/harden/src/audit.ts#L120)

CI gate (the hard incentive): throw if the document's hardening grade is below `min`.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### min

[`Grade`](../type-aliases/Grade.md)

### opts?

`AuditOptions` = `{}`

## Returns

[`DocAudit`](../interfaces/DocAudit.md)
