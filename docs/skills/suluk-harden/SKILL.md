---
description: "Schema HARDENING as a derived contract facet: audit a v4 'Suluk' document's input schemas for the validations that keep weird/oversized input from breaking the system — every string a maxLength + a pattern, every number a maximum, every array a maxItems, every object closed + typed, no any/unknown — score it (A-F), surface the grade to INCENTIVISE the author, and gate CI on a minimum. CANDIDATE tooling."
name: suluk-harden
---

# @suluk/harden

Schema HARDENING as a derived contract facet: audit a v4 'Suluk' document's input schemas for the validations that keep weird/oversized input from breaking the system — every string a maxLength + a pattern, every number a maximum, every array a maxItems, every object closed + typed, no any/unknown — score it (A-F), surface the grade to INCENTIVISE the author, and gate CI on a minimum. CANDIDATE tooling.

## Quick Start

```ts
import { auditDocument } from "@suluk/harden";

const report = auditDocument(doc); // doc: OpenAPIv4Document
report.grade;        // "A" | "B" | "C" | "D" | "F"
report.score;        // 0–100
report.bySeverity;   // { high, medium, low } — counts across all findings
report.byOperation;  // per-operation audits, weakest first
report.findings;     // Finding[] — { rule, severity, path, message, fix }, deduped by rule@path

for (const f of report.findings) {
  console.log(`${f.severity.toUpperCase()} ${f.path}: ${f.message} → ${f.fix}`);
}
```

## Configuration

2 configuration interfaces — see references/config.md for details.

## Quick Reference

**audit:** `auditDocument` (Audit the document's input surface → per-op grades + a deduped rollup + a severity breakdown), `auditOperation` (Audit one request's INPUT surface (request body + typed parameter slots)), `assertGrade` (CI gate (the hard incentive): throw if the document's hardening grade is below `min`), `grade` (`@suluk/harden` — schema hardening as a derived, scored contract facet), `combineGrades` (Combine per-dimension letters into one contract grade (worst + average)), `assertCombinedGrade` (CI gate over a combined grade), `CombinedGrade` (`@suluk/harden` — schema hardening as a derived, scored contract facet), `Audit` (`@suluk/harden` — schema hardening as a derived, scored contract facet), `OpAudit` (`@suluk/harden` — schema hardening as a derived, scored contract facet), `DocAudit` (`@suluk/harden` — schema hardening as a derived, scored contract facet), `Finding` (`@suluk/harden` — schema hardening as a derived, scored contract facet), `Severity` (`@suluk/harden` — schema hardening as a derived, scored contract facet), `Grade` (`@suluk/harden` — schema hardening as a derived, scored contract facet)
**harden:** `hardenSchema` (Recursively add baseline bounds to a JSON Schema), `hardenDocument` (Harden EVERY input schema in a built v4 document IN PLACE — request bodies + all parameter slots (incl)
**readiness:** `auditReadiness` (Audit the document's request bodies for client-sendability + example presence → findings + a readiness grade), `ReadinessAudit`

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When defining typed variables or function parameters → read `references/types.md`
- When configuring options → read `references/config.md` for all settings and defaults

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)