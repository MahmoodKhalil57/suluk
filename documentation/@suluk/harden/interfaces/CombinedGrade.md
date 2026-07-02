[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/harden](../README.md) / CombinedGrade

# Interface: CombinedGrade

Defined in: [audit.ts:136](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/harden/src/audit.ts#L136)

`@suluk/harden` — schema hardening as a derived, scored contract facet. Audit a v4 'Suluk' document's INPUT
schemas for the validations that keep malformed/oversized input from breaking the system, grade them A–F,
surface the grade to incentivise the author, and gate CI on a minimum.

  import { auditDocument, assertGrade } from "@suluk/harden";
  const report = auditDocument(doc);   // { grade, score, byOperation, findings, bySeverity }
  assertGrade(doc, "B");               // throws if the contract is too weak (the hard incentive)

## Properties

### average

> **average**: [`Grade`](../type-aliases/Grade.md)

Defined in: [audit.ts:141](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/harden/src/audit.ts#L141)

the rounded-mean letter (informational — can mask a single failing dimension, so do not gate on it blindly; ties
 round toward the HIGHER letter, so the masking is always optimistic).

***

### grades

> **grades**: [`Grade`](../type-aliases/Grade.md)[]

Defined in: [audit.ts:143](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/harden/src/audit.ts#L143)

the input letters, as given.

***

### worst

> **worst**: [`Grade`](../type-aliases/Grade.md)

Defined in: [audit.ts:138](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/harden/src/audit.ts#L138)

the WORST letter — a contract is as strong as its weakest graded dimension (the safe value to GATE on).
