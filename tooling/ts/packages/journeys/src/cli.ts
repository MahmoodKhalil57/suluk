/**
 * CLI core (C042) — the PURE, filesystem-free heart of `journeys demos`: a v4 contract + `.feature` texts → the demo
 * collection file map (Bruno and/or Postman). The bin (`bin/journeys.ts`) does only argv parsing + file IO around this,
 * so the interesting logic stays unit-testable without touching disk.
 */
import { parseDocument, type OpenAPIv4Document } from "@suluk/core";
import { generateVocabulary } from "./vocabulary";
import { parseFeature } from "./gherkin";
import { compileDemos, renderBruno, renderPostman } from "./demos";
import { extractPublicRows, buildExampleObject, promoteExampleIntoZod } from "./promote";

export type DemoFormat = "bruno" | "postman" | "both";

export interface BuildDemoFilesOptions {
  /** which collection(s) to emit (default "both"). */
  format?: DemoFormat;
  /** collection name (default the contract's info.title). */
  name?: string;
  /** the PROD base URL (the live-call target). */
  baseUrl?: string;
  /** the LOCAL base URL a developer rehearses against first. */
  localBaseUrl?: string;
}

export interface DemoFilesResult {
  /** relative path → file content. When format is "both", Bruno files are under `bruno/`, Postman under `postman/`. */
  files: Record<string, string>;
  scenarios: number;
  requests: number;
}

const slug = (s: string) => s.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase() || "demo";

/** Pure: a v4 document text + `.feature` texts → the demo collection file map. No filesystem. */
export function buildDemoFiles(docText: string, featureTexts: string[], opts: BuildDemoFilesOptions = {}): DemoFilesResult {
  const doc = parseDocument(docText) as OpenAPIv4Document;
  const vocab = generateVocabulary(doc);
  const features = featureTexts.map((t) => parseFeature(t));
  const demos = compileDemos(doc, vocab, features);

  const name = opts.name ?? doc.info?.title ?? "Demo";
  const render = { name, baseUrl: opts.baseUrl, localBaseUrl: opts.localBaseUrl };
  const format = opts.format ?? "both";

  const files: Record<string, string> = {};
  if (format === "bruno" || format === "both") {
    const prefix = format === "both" ? "bruno/" : "";
    for (const [p, c] of Object.entries(renderBruno(demos, render))) files[prefix + p] = c;
  }
  if (format === "postman" || format === "both") {
    const prefix = format === "both" ? "postman/" : "";
    files[`${prefix}${slug(name)}.postman_collection.json`] = renderPostman(demos, render);
  }
  return { files, scenarios: demos.length, requests: demos.reduce((n, d) => n + d.requests.length, 0) };
}

// ---------------------------------------------------------------------------------------------------------------------
// `journeys promote` core — plan @public → Zod source edits (filesystem-free; the bin reads/writes around it).
// ---------------------------------------------------------------------------------------------------------------------

/** A `--target "<scenario>=<file>#<schemaVar>"` mapping. */
export interface PromoteTargetSpec {
  file: string;
  schemaVar: string;
}

/** Parse `"<scenario>=<file>#<schemaVar>"`. The scenario may contain spaces/`=` only before the FIRST `=`. */
export function parseTargetSpec(spec: string): { scenario: string; file: string; schemaVar: string } | null {
  const eq = spec.indexOf("=");
  const hash = spec.lastIndexOf("#");
  if (eq < 0 || hash < eq) return null;
  return { scenario: spec.slice(0, eq).trim(), file: spec.slice(eq + 1, hash).trim(), schemaVar: spec.slice(hash + 1).trim() };
}

export interface PromotionRow {
  scenario: string;
  file?: string;
  schemaVar?: string;
  status: "applied" | "skipped";
  reason: string;
}
export interface PromotionFileResult {
  file: string;
  original: string;
  updated: string;
  changed: boolean;
}
export interface PromotionPlan {
  files: PromotionFileResult[];
  rows: PromotionRow[];
}

/**
 * Plan the promotions for every `@public` Examples row: build the public example (content-typed) and apply
 * `promoteExampleIntoZod` to the target's (pre-read) source — accumulating multiple rows per file. Pure: returns the
 * before/after source per file (the bin diffs + writes). The never-clobber refusals surface as skipped rows.
 */
export function planPromotions(featureTexts: string[], targets: Map<string, PromoteTargetSpec>, sources: Record<string, string>, opts: { because?: string } = {}): PromotionPlan {
  const features = featureTexts.map((t) => parseFeature(t));
  const working: Record<string, string> = { ...sources };
  const rows: PromotionRow[] = [];
  for (const pub of extractPublicRows(features)) {
    const target = targets.get(pub.scenario);
    if (!target) {
      rows.push({ scenario: pub.scenario, status: "skipped", reason: "no --target maps this scenario" });
      continue;
    }
    if (!(target.file in working)) {
      rows.push({ scenario: pub.scenario, file: target.file, schemaVar: target.schemaVar, status: "skipped", reason: `source file not loaded: ${target.file}` });
      continue;
    }
    const example = buildExampleObject(pub.headers, pub.row);
    const provenance = opts.because ? `${opts.because} (${pub.scenario})` : `promoted from ${pub.scenario}`;
    const r = promoteExampleIntoZod(working[target.file], target.schemaVar, example, provenance);
    if (r.changed) working[target.file] = r.source;
    rows.push({ scenario: pub.scenario, file: target.file, schemaVar: target.schemaVar, status: r.changed ? "applied" : "skipped", reason: r.reason });
  }
  const files = Object.keys(sources).map((f) => ({ file: f, original: sources[f], updated: working[f], changed: working[f] !== sources[f] }));
  return { files, rows };
}

/** A minimal context diff (the edit is localized to one schema statement). Lines: `  ` ctx, `- ` removed, `+ ` added. */
export function miniDiff(oldText: string, newText: string, ctx = 2): string {
  const a = oldText.split("\n");
  const b = newText.split("\n");
  let s = 0;
  while (s < a.length && s < b.length && a[s] === b[s]) s++;
  let ea = a.length;
  let eb = b.length;
  while (ea > s && eb > s && a[ea - 1] === b[eb - 1]) {
    ea--;
    eb--;
  }
  const out: string[] = [];
  for (let i = Math.max(0, s - ctx); i < s; i++) out.push(`  ${a[i]}`);
  for (let i = s; i < ea; i++) out.push(`- ${a[i]}`);
  for (let i = s; i < eb; i++) out.push(`+ ${b[i]}`);
  for (let i = ea; i < Math.min(a.length, ea + ctx); i++) out.push(`  ${a[i]}`);
  return out.join("\n");
}
