/**
 * BDD coverage as a graded dimension (C043). `bindFeatures` already computes which contract operations a `.feature`
 * suite covers; this turns that into a letter (using @suluk/harden's `grade`) so it folds into harden's `combineGrades`
 * alongside the security + readiness grades — the journeys-owned dimension of the unified contract grade. It lives in
 * journeys (not harden) because coverage needs the `.feature` files, and harden must not depend on journeys (cycle).
 */
import { grade, type Grade } from "@suluk/harden";
import type { GapReport } from "./bind";

export interface CoverageGrade {
  grade: Grade;
  score: number;
  covered: number;
  total: number;
  /** uncovered operation names — the "gaps"; generate a Scenario Outline for each (renderScenarioOutlines). */
  uncovered: string[];
}

/** Grade a gap report's contract→authored coverage (covered/total) and surface the uncovered ops. */
export function coverageGrade(report: GapReport): CoverageGrade {
  const { covered, total, holes } = report.coverage;
  const score = total === 0 ? 100 : Math.round((covered / total) * 100);
  return { grade: grade(score), score, covered, total, uncovered: holes.map((h) => h.name) };
}
