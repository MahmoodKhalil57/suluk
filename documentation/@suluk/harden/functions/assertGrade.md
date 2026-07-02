[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/harden](../README.md) / assertGrade

# Function: assertGrade()

> **assertGrade**(`doc`, `min`, `opts?`): [`DocAudit`](../interfaces/DocAudit.md)

Defined in: [audit.ts:120](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/harden/src/audit.ts#L120)

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
