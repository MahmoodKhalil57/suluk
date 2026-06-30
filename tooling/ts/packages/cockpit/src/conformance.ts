/**
 * Conformance gates (C045) — the UNIFIED contract audit, the cockpit's "are you ready to ship?" checklist grown to fold
 * the readiness DIMENSIONS into the same `Gate[]` model as `contractGates`. It COMPOSES shipped Suluk primitives — no
 * new audit logic lives here:
 *   • input hardening + schema readiness   ← @suluk/harden (auditDocument · auditReadiness, C043)
 *   • cost completeness                     ← @suluk/cost   (costAudit)
 *   • settlement "names a lever"            ← @suluk/cost   (settlementAudit, C044)
 *   • implied error responses declared      ← @suluk/cost   (impliedErrorStatuses vs the op's declared statuses, C044)
 *
 * This is the generic form of toolfactory's `conformance-gate` (which hand-folds contract+errors+governance+stores+
 * hardening): a consumer's CI collapses to `shipSummary([...contractGates(doc, baseline), ...conformanceGates(doc)])`
 * (or `assertConformance(doc)`). Pure (no host) → unit-tested. cockpit never deps journeys (BDD coverage folds in via
 * harden's combineGrades upstream, C043).
 */
import { type OpenAPIv4Document, type Request } from "@suluk/core";
import { auditDocument, auditReadiness, type Grade } from "@suluk/harden";
import { costAudit, settlementAudit, impliedErrorStatuses, eachOperation } from "@suluk/cost";
import type { Gate, GateStatus } from "./lifecycle";

const GRADE_STATUS: Record<Grade, GateStatus> = { A: "ok", B: "ok", C: "todo", D: "todo", F: "error" };

/** The numeric statuses a request DECLARES (responses may be a map keyed by status or an array of {status}). */
function declaredStatuses(req: Request): Set<number> {
  const r = (req as { responses?: unknown }).responses;
  const out = new Set<number>();
  if (Array.isArray(r)) {
    for (const x of r) {
      const s = Number((x as { status?: unknown }).status);
      if (Number.isFinite(s)) out.add(s);
    }
  } else if (r && typeof r === "object") {
    for (const k of Object.keys(r)) {
      const s = Number(k);
      if (Number.isFinite(s)) out.add(s);
    }
  }
  return out;
}

const findingStatus = (findings: { severity: string }[]): GateStatus =>
  findings.length === 0 ? "ok" : findings.some((f) => f.severity === "high" || f.severity === "error") ? "error" : "todo";

/** The CONFORMANCE gates — the readiness dimensions, each composed from a shipped Suluk audit. No host needed. */
export function conformanceGates(doc: OpenAPIv4Document): Gate[] {
  const gates: Gate[] = [];

  // input hardening (security)
  const sec = auditDocument(doc);
  gates.push({
    id: "hardened", title: "Input hardening",
    status: GRADE_STATUS[sec.grade],
    detail: `grade ${sec.grade} (${sec.score}/100) — ${sec.bySeverity.high} high · ${sec.bySeverity.medium} medium`,
    action: GRADE_STATUS[sec.grade] === "ok" ? undefined : "harden the input schemas (maxLength/pattern/maximum/maxItems; close objects)",
  });

  // schema readiness (computed-required / missing-example)
  const rd = auditReadiness(doc);
  gates.push({
    id: "readiness", title: "Schema readiness",
    status: GRADE_STATUS[rd.grade],
    detail: `grade ${rd.grade} (${rd.score}/100) — ${rd.findings.length} finding${rd.findings.length === 1 ? "" : "s"}`,
    action: rd.findings.length ? "fix computed-required fields + add request examples" : undefined,
  });

  // cost completeness
  const cf = costAudit(doc);
  gates.push({
    id: "costed", title: "Cost declared",
    status: findingStatus(cf),
    detail: cf.length ? `${cf.length} cost finding${cf.length === 1 ? "" : "s"}` : "every priced op declares its cost",
    action: cf.length ? "complete x-suluk-cost" : undefined,
  });

  // settlement — every priced op names a lever (C044)
  const sf = settlementAudit(doc);
  gates.push({
    id: "settled", title: "Cost settlement (the lever)",
    status: findingStatus(sf),
    detail: sf.length ? `${sf.length} settlement finding${sf.length === 1 ? "" : "s"} (${[...new Set(sf.map((f) => f.rule))].join(", ")})` : "every priced op names a lever (credit | rate-limited | free)",
    action: sf.length ? "add x-suluk-cost.settlement (or the missing x-suluk-ratelimit cap)" : undefined,
  });

  // implied error responses declared (C044)
  let missing = 0;
  for (const { req } of eachOperation(doc)) {
    const declared = declaredStatuses(req);
    for (const s of impliedErrorStatuses(req)) if (!declared.has(s)) missing++;
  }
  gates.push({
    id: "errors", title: "Implied error responses declared",
    status: missing ? "todo" : "ok",
    detail: missing ? `${missing} facet-implied error status${missing === 1 ? "" : "es"} not declared (credit→402, auth→401, scope→403, ratelimit→429, upstream→502)` : "every facet-implied error response is declared",
    action: missing ? "declare the implied error responses on each operation" : undefined,
  });

  return gates;
}

/** CI gate (the hard incentive): throw if any conformance gate is an `error` (a blocker). Returns the gates otherwise. */
export function assertConformance(doc: OpenAPIv4Document): Gate[] {
  const gates = conformanceGates(doc);
  const blockers = gates.filter((g) => g.status === "error");
  if (blockers.length) {
    throw new Error(`@suluk/cockpit: contract is not conformant — ${blockers.map((g) => `${g.title}: ${g.detail}`).join(" · ")}`);
  }
  return gates;
}
