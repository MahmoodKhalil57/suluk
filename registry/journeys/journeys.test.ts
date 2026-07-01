/**
 * BDD coverage harness (Suluk registry: `journeys`) — binds your authored `.feature` stories against the step vocabulary
 * projected from your v4 contract and gates on coverage. A pure function of the document: no server, no network. Run it in
 * CI (`bun test`). Skips cleanly until you generate a contract at `config.contractPath` — so a fresh platform is green,
 * and the gate engages the moment a contract exists. The binding + grading logic lives in `@suluk/journeys`; this is the
 * owned wiring. Targets `src/journeys.test.ts`.
 */
import { test, expect } from "bun:test";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parseFeature, generateVocabulary, bindFeatures, coverageGrade } from "@suluk/journeys";
import type { OpenAPIv4Document } from "@suluk/core";
import config from "../journeys.config";

const ORDER = ["F", "D", "C", "B", "A"] as const;
const haveContract = existsSync(config.contractPath);

test.skipIf(!haveContract)("authored journeys meet the coverage floor", () => {
  const doc = JSON.parse(readFileSync(config.contractPath, "utf8")) as OpenAPIv4Document;
  const vocab = generateVocabulary(doc);
  const features = readdirSync(config.featuresDir)
    .filter((f) => f.endsWith(".feature"))
    .map((f) => parseFeature(readFileSync(join(config.featuresDir, f), "utf8")));

  const report = bindFeatures(vocab, features);
  const cov = coverageGrade(report);
  console.log(`journeys coverage: ${cov.grade} (${cov.score}) — ${cov.covered}/${cov.total} ops; gaps: ${cov.uncovered.join(", ") || "none"}`);

  expect(ORDER.indexOf(cov.grade)).toBeGreaterThanOrEqual(ORDER.indexOf(config.coverageFloor));
});
