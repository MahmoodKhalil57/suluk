[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/harden](../README.md) / Finding

# Interface: Finding

Defined in: [audit.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/harden/src/audit.ts#L17)

`@suluk/harden` — schema hardening as a derived, scored contract facet. Audit a v4 'Suluk' document's INPUT
schemas for the validations that keep malformed/oversized input from breaking the system, grade them A–F,
surface the grade to incentivise the author, and gate CI on a minimum.

  import { auditDocument, assertGrade } from "@suluk/harden";
  const report = auditDocument(doc);   // { grade, score, byOperation, findings, bySeverity }
  assertGrade(doc, "B");               // throws if the contract is too weak (the hard incentive)

## Properties

### fix

> **fix**: `string`

Defined in: [audit.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/harden/src/audit.ts#L17)

***

### message

> **message**: `string`

Defined in: [audit.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/harden/src/audit.ts#L17)

***

### path

> **path**: `string`

Defined in: [audit.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/harden/src/audit.ts#L17)

***

### rule

> **rule**: `string`

Defined in: [audit.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/harden/src/audit.ts#L17)

***

### severity

> **severity**: [`Severity`](../type-aliases/Severity.md)

Defined in: [audit.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/harden/src/audit.ts#L17)
