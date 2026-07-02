[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/payments](../README.md) / RefundStatus

# Enumeration: RefundStatus

Defined in: [tooling/ts/packages/payments/src/types.ts:57](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/payments/src/types.ts#L57)

Refund status — a SEPARATE enum from [PaymentStatus](PaymentStatus.md) with overlapping integers (mirrors Prism). `REFUND_PENDING`
 is a normal success state for many processors — treat PENDING + SUCCESS both as success.

## Enumeration Members

### REFUND\_FAILURE

> **REFUND\_FAILURE**: `1`

Defined in: [tooling/ts/packages/payments/src/types.ts:59](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/payments/src/types.ts#L59)

***

### REFUND\_MANUAL\_REVIEW

> **REFUND\_MANUAL\_REVIEW**: `2`

Defined in: [tooling/ts/packages/payments/src/types.ts:60](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/payments/src/types.ts#L60)

***

### REFUND\_PENDING

> **REFUND\_PENDING**: `3`

Defined in: [tooling/ts/packages/payments/src/types.ts:61](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/payments/src/types.ts#L61)

***

### REFUND\_SUCCESS

> **REFUND\_SUCCESS**: `4`

Defined in: [tooling/ts/packages/payments/src/types.ts:62](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/payments/src/types.ts#L62)

***

### REFUND\_TRANSACTION\_FAILURE

> **REFUND\_TRANSACTION\_FAILURE**: `5`

Defined in: [tooling/ts/packages/payments/src/types.ts:63](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/payments/src/types.ts#L63)

***

### UNSPECIFIED

> **UNSPECIFIED**: `0`

Defined in: [tooling/ts/packages/payments/src/types.ts:58](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/payments/src/types.ts#L58)
