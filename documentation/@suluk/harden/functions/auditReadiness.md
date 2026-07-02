[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/harden](../README.md) / auditReadiness

# Function: auditReadiness()

> **auditReadiness**(`doc`, `opts?`): [`ReadinessAudit`](../interfaces/ReadinessAudit.md)

Defined in: [readiness.ts:39](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/harden/src/readiness.ts#L39)

Audit the document's request bodies for client-sendability + example presence → findings + a readiness grade.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### opts?

[`ReadinessOptions`](../interfaces/ReadinessOptions.md) = `{}`

## Returns

[`ReadinessAudit`](../interfaces/ReadinessAudit.md)
