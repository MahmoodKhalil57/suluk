/**
 * CLI core (C042) — the PURE, filesystem-free heart of `journeys demos`: a v4 contract + `.feature` texts → the demo
 * collection file map (Bruno and/or Postman). The bin (`bin/journeys.ts`) does only argv parsing + file IO around this,
 * so the interesting logic stays unit-testable without touching disk.
 */
import { parseDocument, type OpenAPIv4Document } from "@suluk/core";
import { generateVocabulary } from "./vocabulary";
import { parseFeature } from "./gherkin";
import { compileDemos, renderBruno, renderPostman } from "./demos";

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
