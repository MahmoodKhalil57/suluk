[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/reference](../README.md) / auditDocument

# Function: auditDocument()

> **auditDocument**(`doc`, `opts?`): [`DocAudit`](../interfaces/DocAudit.md)

Defined in: [harden/src/audit.ts:98](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/harden/src/audit.ts#L98)

Audit the document's input surface → per-op grades + a deduped rollup + a severity breakdown.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### opts?

`AuditOptions` = `{}`

## Returns

[`DocAudit`](../interfaces/DocAudit.md)
