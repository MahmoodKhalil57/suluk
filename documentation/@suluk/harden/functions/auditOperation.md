[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/harden](../README.md) / auditOperation

# Function: auditOperation()

> **auditOperation**(`doc`, `uri`, `name`, `req`): [`OpAudit`](../interfaces/OpAudit.md)

Defined in: [audit.ts:84](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/harden/src/audit.ts#L84)

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
