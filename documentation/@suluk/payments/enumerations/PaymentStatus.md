[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/payments](../README.md) / PaymentStatus

# Enumeration: PaymentStatus

Defined in: [tooling/ts/packages/payments/src/types.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/types.ts#L32)

Payment status — INTEGER values mirroring Prism exactly (do NOT renumber; a real Prism backend + connector code depend
on these). A soft decline is `FAILURE` returned IN-BAND on the response (never thrown). Use with authorize/capture/void.

## Enumeration Members

### AUTHENTICATION\_FAILED

> **AUTHENTICATION\_FAILED**: `2`

Defined in: [tooling/ts/packages/payments/src/types.ts:35](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/types.ts#L35)

***

### AUTHENTICATION\_PENDING

> **AUTHENTICATION\_PENDING**: `4`

Defined in: [tooling/ts/packages/payments/src/types.ts:37](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/types.ts#L37)

***

### AUTHENTICATION\_SUCCESSFUL

> **AUTHENTICATION\_SUCCESSFUL**: `5`

Defined in: [tooling/ts/packages/payments/src/types.ts:38](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/types.ts#L38)

***

### AUTHORIZATION\_FAILED

> **AUTHORIZATION\_FAILED**: `7`

Defined in: [tooling/ts/packages/payments/src/types.ts:40](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/types.ts#L40)

***

### AUTHORIZED

> **AUTHORIZED**: `6`

Defined in: [tooling/ts/packages/payments/src/types.ts:39](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/types.ts#L39)

***

### CAPTURE\_FAILED

> **CAPTURE\_FAILED**: `14`

Defined in: [tooling/ts/packages/payments/src/types.ts:45](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/types.ts#L45)

***

### CAPTURE\_INITIATED

> **CAPTURE\_INITIATED**: `13`

Defined in: [tooling/ts/packages/payments/src/types.ts:44](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/types.ts#L44)

***

### CHARGED

> **CHARGED**: `8`

Defined in: [tooling/ts/packages/payments/src/types.ts:41](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/types.ts#L41)

***

### EXPIRED

> **EXPIRED**: `26`

Defined in: [tooling/ts/packages/payments/src/types.ts:52](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/types.ts#L52)

***

### FAILURE

> **FAILURE**: `21`

Defined in: [tooling/ts/packages/payments/src/types.ts:50](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/types.ts#L50)

***

### PARTIAL\_CHARGED

> **PARTIAL\_CHARGED**: `17`

Defined in: [tooling/ts/packages/payments/src/types.ts:47](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/types.ts#L47)

***

### PARTIALLY\_AUTHORIZED

> **PARTIALLY\_AUTHORIZED**: `25`

Defined in: [tooling/ts/packages/payments/src/types.ts:51](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/types.ts#L51)

***

### PENDING

> **PENDING**: `20`

Defined in: [tooling/ts/packages/payments/src/types.ts:49](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/types.ts#L49)

***

### ROUTER\_DECLINED

> **ROUTER\_DECLINED**: `3`

Defined in: [tooling/ts/packages/payments/src/types.ts:36](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/types.ts#L36)

***

### STARTED

> **STARTED**: `1`

Defined in: [tooling/ts/packages/payments/src/types.ts:34](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/types.ts#L34)

***

### UNRESOLVED

> **UNRESOLVED**: `19`

Defined in: [tooling/ts/packages/payments/src/types.ts:48](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/types.ts#L48)

***

### UNSPECIFIED

> **UNSPECIFIED**: `0`

Defined in: [tooling/ts/packages/payments/src/types.ts:33](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/types.ts#L33)

***

### VOID\_FAILED

> **VOID\_FAILED**: `15`

Defined in: [tooling/ts/packages/payments/src/types.ts:46](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/types.ts#L46)

***

### VOID\_INITIATED

> **VOID\_INITIATED**: `12`

Defined in: [tooling/ts/packages/payments/src/types.ts:43](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/types.ts#L43)

***

### VOIDED

> **VOIDED**: `11`

Defined in: [tooling/ts/packages/payments/src/types.ts:42](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/types.ts#L42)
