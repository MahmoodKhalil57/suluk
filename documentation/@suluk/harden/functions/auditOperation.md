[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/harden](../README.md) / auditOperation

# Function: auditOperation()

> **auditOperation**(`doc`, `uri`, `name`, `req`): [`OpAudit`](../interfaces/OpAudit.md)

Defined in: [audit.ts:84](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/harden/src/audit.ts#L84)

Audit one request's INPUT surface (request body + typed parameter slots).

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### uri

`string`

### name

`string`

### req

`RawReq`

## Returns

[`OpAudit`](../interfaces/OpAudit.md)
