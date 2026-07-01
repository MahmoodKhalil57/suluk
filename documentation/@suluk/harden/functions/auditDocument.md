[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/harden](../README.md) / auditDocument

# Function: auditDocument()

> **auditDocument**(`doc`, `opts?`): [`DocAudit`](../interfaces/DocAudit.md)

Defined in: [audit.ts:98](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/harden/src/audit.ts#L98)

Audit the document's input surface → per-op grades + a deduped rollup + a severity breakdown.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### opts?

`AuditOptions` = `{}`

## Returns

[`DocAudit`](../interfaces/DocAudit.md)
