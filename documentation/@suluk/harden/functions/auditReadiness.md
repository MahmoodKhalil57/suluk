[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/harden](../README.md) / auditReadiness

# Function: auditReadiness()

> **auditReadiness**(`doc`, `opts?`): [`ReadinessAudit`](../interfaces/ReadinessAudit.md)

Defined in: [readiness.ts:39](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/harden/src/readiness.ts#L39)

Audit the document's request bodies for client-sendability + example presence → findings + a readiness grade.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### opts?

[`ReadinessOptions`](../interfaces/ReadinessOptions.md) = `{}`

## Returns

[`ReadinessAudit`](../interfaces/ReadinessAudit.md)
