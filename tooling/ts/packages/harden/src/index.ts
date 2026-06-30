/**
 * @suluk/harden — schema hardening as a derived, scored contract facet. Audit a v4 'Suluk' document's INPUT
 * schemas for the validations that keep malformed/oversized input from breaking the system, grade them A–F,
 * surface the grade to incentivise the author, and gate CI on a minimum.
 *
 *   import { auditDocument, assertGrade } from "@suluk/harden";
 *   const report = auditDocument(doc);   // { grade, score, byOperation, findings, bySeverity }
 *   assertGrade(doc, "B");               // throws if the contract is too weak (the hard incentive)
 */
export {
  auditDocument, auditOperation, assertGrade, grade,
  // Stage 1.5: combine THIS package's input-schema grade with @suluk/agents' agent-composition grade into one
  // contract grade — on the LETTER (the scores are non-comparable). Pure combinator; the caller passes the letters.
  combineGrades, assertCombinedGrade, type CombinedGrade,
  type Audit, type OpAudit, type DocAudit, type Finding, type Severity, type Grade,
} from "./audit";
// the inverse of the audit — the hardening TRANSFORM that adds the baseline bounds the audit grades for.
export { hardenSchema, hardenDocument, type HardenOptions } from "./harden";
// C043: a SECOND dimension — schema-fact READINESS (computed-required, request-without-example), separate from the
// security grade. Fold its letter into `combineGrades` alongside the security grade + journeys coverage.
export { auditReadiness, type ReadinessAudit, type ReadinessOptions } from "./readiness";
