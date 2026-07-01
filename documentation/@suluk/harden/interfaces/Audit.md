[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/harden](../README.md) / Audit

# Interface: Audit

Defined in: [audit.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/harden/src/audit.ts#L18)

`@suluk/harden` — schema hardening as a derived, scored contract facet. Audit a v4 'Suluk' document's INPUT
schemas for the validations that keep malformed/oversized input from breaking the system, grade them A–F,
surface the grade to incentivise the author, and gate CI on a minimum.

  import { auditDocument, assertGrade } from "@suluk/harden";
  const report = auditDocument(doc);   // { grade, score, byOperation, findings, bySeverity }
  assertGrade(doc, "B");               // throws if the contract is too weak (the hard incentive)

## Extended by

- [`OpAudit`](OpAudit.md)
- [`DocAudit`](DocAudit.md)
- [`DocAudit`](../../reference/interfaces/DocAudit.md)
- [`OpAudit`](../../reference/interfaces/OpAudit.md)

## Properties

### clean

> **clean**: `number`

Defined in: [audit.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/harden/src/audit.ts#L18)

***

### findings

> **findings**: [`Finding`](Finding.md)[]

Defined in: [audit.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/harden/src/audit.ts#L18)

***

### grade

> **grade**: [`Grade`](../type-aliases/Grade.md)

Defined in: [audit.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/harden/src/audit.ts#L18)

***

### nodes

> **nodes**: `number`

Defined in: [audit.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/harden/src/audit.ts#L18)

***

### score

> **score**: `number`

Defined in: [audit.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/harden/src/audit.ts#L18)
