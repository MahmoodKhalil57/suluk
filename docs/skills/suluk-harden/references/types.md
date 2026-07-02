# Types & Enums

## audit

### `CombinedGrade`
`@suluk/harden` — schema hardening as a derived, scored contract facet. Audit a v4 'Suluk' document's INPUT
schemas for the validations that keep malformed/oversized input from breaking the system, grade them A–F,
surface the grade to incentivise the author, and gate CI on a minimum.

  import { auditDocument, assertGrade } from "@suluk/harden";
  const report = auditDocument(doc);   // { grade, score, byOperation, findings, bySeverity }
  assertGrade(doc, "B");               // throws if the contract is too weak (the hard incentive)
**Properties:**
- `worst: Grade` — the WORST letter — a contract is as strong as its weakest graded dimension (the safe value to GATE on).
- `average: Grade` — the rounded-mean letter (informational — can mask a single failing dimension, so do not gate on it blindly; ties
 round toward the HIGHER letter, so the masking is always optimistic).
- `grades: Grade[]` — the input letters, as given.

### `Audit`
`@suluk/harden` — schema hardening as a derived, scored contract facet. Audit a v4 'Suluk' document's INPUT
schemas for the validations that keep malformed/oversized input from breaking the system, grade them A–F,
surface the grade to incentivise the author, and gate CI on a minimum.

  import { auditDocument, assertGrade } from "@suluk/harden";
  const report = auditDocument(doc);   // { grade, score, byOperation, findings, bySeverity }
  assertGrade(doc, "B");               // throws if the contract is too weak (the hard incentive)
**Properties:**
- `findings: Finding[]`
- `nodes: number`
- `clean: number`
- `score: number`
- `grade: Grade`

### `OpAudit`
`@suluk/harden` — schema hardening as a derived, scored contract facet. Audit a v4 'Suluk' document's INPUT
schemas for the validations that keep malformed/oversized input from breaking the system, grade them A–F,
surface the grade to incentivise the author, and gate CI on a minimum.

  import { auditDocument, assertGrade } from "@suluk/harden";
  const report = auditDocument(doc);   // { grade, score, byOperation, findings, bySeverity }
  assertGrade(doc, "B");               // throws if the contract is too weak (the hard incentive)
**Properties:**
- `operation: string`
- `method: string`
- `path: string`
- `findings: Finding[]`
- `nodes: number`
- `clean: number`
- `score: number`
- `grade: Grade`

### `DocAudit`
`@suluk/harden` — schema hardening as a derived, scored contract facet. Audit a v4 'Suluk' document's INPUT
schemas for the validations that keep malformed/oversized input from breaking the system, grade them A–F,
surface the grade to incentivise the author, and gate CI on a minimum.

  import { auditDocument, assertGrade } from "@suluk/harden";
  const report = auditDocument(doc);   // { grade, score, byOperation, findings, bySeverity }
  assertGrade(doc, "B");               // throws if the contract is too weak (the hard incentive)
**Properties:**
- `byOperation: OpAudit[]`
- `bySeverity: Record<Severity, number>`
- `findings: Finding[]`
- `nodes: number`
- `clean: number`
- `score: number`
- `grade: Grade`

### `Finding`
`@suluk/harden` — schema hardening as a derived, scored contract facet. Audit a v4 'Suluk' document's INPUT
schemas for the validations that keep malformed/oversized input from breaking the system, grade them A–F,
surface the grade to incentivise the author, and gate CI on a minimum.

  import { auditDocument, assertGrade } from "@suluk/harden";
  const report = auditDocument(doc);   // { grade, score, byOperation, findings, bySeverity }
  assertGrade(doc, "B");               // throws if the contract is too weak (the hard incentive)
**Properties:**
- `rule: string`
- `severity: Severity`
- `path: string`
- `message: string`
- `fix: string`

### `Severity`
`@suluk/harden` — schema hardening as a derived, scored contract facet. Audit a v4 'Suluk' document's INPUT
schemas for the validations that keep malformed/oversized input from breaking the system, grade them A–F,
surface the grade to incentivise the author, and gate CI on a minimum.

  import { auditDocument, assertGrade } from "@suluk/harden";
  const report = auditDocument(doc);   // { grade, score, byOperation, findings, bySeverity }
  assertGrade(doc, "B");               // throws if the contract is too weak (the hard incentive)
```ts
"high" | "medium" | "low"
```

### `Grade`
`@suluk/harden` — schema hardening as a derived, scored contract facet. Audit a v4 'Suluk' document's INPUT
schemas for the validations that keep malformed/oversized input from breaking the system, grade them A–F,
surface the grade to incentivise the author, and gate CI on a minimum.

  import { auditDocument, assertGrade } from "@suluk/harden";
  const report = auditDocument(doc);   // { grade, score, byOperation, findings, bySeverity }
  assertGrade(doc, "B");               // throws if the contract is too weak (the hard incentive)
```ts
"A" | "B" | "C" | "D" | "F"
```

## readiness

### `ReadinessAudit`
**Properties:**
- `findings: Finding[]`
- `nodes: number`
- `clean: number`
- `score: number`
- `grade: Grade`
