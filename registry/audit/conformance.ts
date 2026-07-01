/**
 * Conformance gate (Suluk registry: `audit`) — the unified CI readiness pipeline for your generated platform. It loads
 * your v4 "Suluk" contract and runs the full ship-readiness audit in one place, folding four independent dimensions into
 * one pass/fail:
 *   - `conformanceGates` / `shipSummary` (@suluk/cockpit) — the lifecycle gates (valid doc, deploy shape, …).
 *   - `auditDocument`  (@suluk/harden) — the input-hardening security grade.
 *   - `auditReadiness` (@suluk/harden) — the schema-fact readiness grade.
 *   - `combineGrades`  (@suluk/harden) — the two letters collapsed to the worst + average.
 * Run it in CI: `bun run scripts/conformance.ts [path/to/openapi.v4.json]`. Exits non-zero when a gate blocks or the
 * combined grade is below the floor — this is the single command your pipeline gates on. Pure logic in the packages; this
 * script is the owned wiring (edit the DOC_PATH default / grade floor to taste).
 */
import { conformanceGates, shipSummary } from "@suluk/cockpit";
import { auditDocument, auditReadiness, combineGrades, type Grade } from "@suluk/harden";
import type { OpenAPIv4Document } from "@suluk/core";

/** The lowest combined grade CI accepts (A best … F worst). */
const GRADE_FLOOR: Grade = "B";
const ORDER: Grade[] = ["F", "D", "C", "B", "A"];

const DOC_PATH = process.argv[2] ?? "openapi.v4.json";

async function loadDoc(path: string): Promise<OpenAPIv4Document> {
  const file = Bun.file(path);
  if (!(await file.exists())) {
    console.error(`✗ conformance: contract not found at ${path}. Pass a path: bun run scripts/conformance.ts <doc>`);
    process.exit(2);
  }
  return (await file.json()) as OpenAPIv4Document;
}

async function main() {
  const doc = await loadDoc(DOC_PATH);

  // 1) lifecycle gates
  const gates = conformanceGates(doc);
  const ship = shipSummary(gates);

  // 2+3) the two harden dimensions → 4) the combined grade
  const security = auditDocument(doc);
  const readiness = auditReadiness(doc);
  const combined = combineGrades([security.grade, readiness.grade]);
  const gradeOk = ORDER.indexOf(combined.worst) >= ORDER.indexOf(GRADE_FLOOR);

  // report
  console.log(`\n▸ conformance — ${DOC_PATH}`);
  for (const g of gates) console.log(`  ${icon(g.status)} ${g.title}${g.status === "ok" ? "" : ` — ${g.detail}`}`);
  console.log(`\n  security  ${security.grade} (${security.score})`);
  console.log(`  readiness ${readiness.grade} (${readiness.score})`);
  console.log(`  combined  worst ${combined.worst} · avg ${combined.average}  (floor ${GRADE_FLOOR})`);
  console.log(`\n  ${ship.line}`);

  if (!ship.ready || !gradeOk) {
    console.error(`\n✗ conformance FAILED${!ship.ready ? " — gates block" : ""}${!gradeOk ? ` — grade ${combined.worst} below floor ${GRADE_FLOOR}` : ""}`);
    process.exit(1);
  }
  console.log(`\n✓ conformance PASSED — ready to ship at grade ${combined.worst}.`);
}

function icon(status: string): string {
  return status === "ok" ? "✓" : status === "error" ? "✗" : status === "warn" ? "▲" : status === "todo" ? "○" : "·";
}

main();
