[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/reference](../README.md) / auditOperation

# Function: auditOperation()

> **auditOperation**(`doc`, `uri`, `name`, `req`): [`OpAudit`](../interfaces/OpAudit.md)

Defined in: [harden/src/audit.ts:84](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/harden/src/audit.ts#L84)

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
