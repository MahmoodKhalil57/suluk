[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/harden](../README.md) / auditReadiness

# Function: auditReadiness()

> **auditReadiness**(`doc`, `opts?`): [`ReadinessAudit`](../interfaces/ReadinessAudit.md)

Defined in: [readiness.ts:39](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/harden/src/readiness.ts#L39)

Audit the document's request bodies for client-sendability + example presence → findings + a readiness grade.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### opts?

[`ReadinessOptions`](../interfaces/ReadinessOptions.md) = `{}`

## Returns

[`ReadinessAudit`](../interfaces/ReadinessAudit.md)
