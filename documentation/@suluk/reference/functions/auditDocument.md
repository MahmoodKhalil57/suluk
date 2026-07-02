[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/reference](../README.md) / auditDocument

# Function: auditDocument()

> **auditDocument**(`doc`, `opts?`): [`DocAudit`](../interfaces/DocAudit.md)

Defined in: [harden/src/audit.ts:98](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/harden/src/audit.ts#L98)

Audit the document's input surface → per-op grades + a deduped rollup + a severity breakdown.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### opts?

`AuditOptions` = `{}`

## Returns

[`DocAudit`](../interfaces/DocAudit.md)
