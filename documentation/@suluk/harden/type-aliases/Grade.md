[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/harden](../README.md) / Grade

# Type Alias: Grade

> **Grade** = `"A"` \| `"B"` \| `"C"` \| `"D"` \| `"F"`

Defined in: [audit.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/harden/src/audit.ts#L16)

`@suluk/harden` — schema hardening as a derived, scored contract facet. Audit a v4 'Suluk' document's INPUT
schemas for the validations that keep malformed/oversized input from breaking the system, grade them A–F,
surface the grade to incentivise the author, and gate CI on a minimum.

  import { auditDocument, assertGrade } from "@suluk/harden";
  const report = auditDocument(doc);   // { grade, score, byOperation, findings, bySeverity }
  assertGrade(doc, "B");               // throws if the contract is too weak (the hard incentive)
