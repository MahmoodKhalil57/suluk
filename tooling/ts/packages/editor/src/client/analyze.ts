/**
 * The editor's analysis core — pure, browser-safe, framework-free. Turns the source text into everything the UI
 * needs: the parsed document, parse/validation diagnostics (with best-effort source positions for the lint gutter),
 * and the hardening grade. Runs entirely in the browser; the same @suluk/core + @suluk/harden a Worker would call.
 */
import { validateDocument } from "@suluk/core";
import { auditDocument, type Grade } from "@suluk/harden";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

export type Format = "json" | "yaml";

export interface Issue {
  severity: "error" | "warning";
  message: string;
  /** JSON-Pointer-ish path into the document (validation) or "" (parse). */
  path: string;
  /** Source offset range, best-effort. */
  from: number;
  to: number;
}

export interface Analysis {
  /** Parsed document, or null when the text doesn't parse. */
  doc: unknown | null;
  parseOk: boolean;
  /** True when it parsed AND validated as a v4 document. */
  valid: boolean;
  issues: Issue[];
  grade: Grade | null;
  /** Best detected OpenAPI major: "4" (v4 candidate), "3" (3.x — offer upgrade), or null. */
  major: "4" | "3" | null;
}

export function parseSource(text: string, format: Format): { doc: unknown | null; error?: Issue } {
  const t = text.trim();
  if (!t) return { doc: null };
  try {
    const doc = format === "yaml" ? parseYaml(text) : JSON.parse(text);
    return { doc };
  } catch (e) {
    return { doc: null, error: parseErrorToIssue(e, text, format) };
  }
}

function parseErrorToIssue(e: unknown, text: string, format: Format): Issue {
  const msg = e instanceof Error ? e.message : String(e);
  let from = 0;
  // V8 JSON: "... at position 123" / "... at line 4 column 1". YAML lib: error.pos / error.linePos.
  const anyE = e as { pos?: [number, number]; linePos?: Array<{ line: number; col: number }> };
  if (format === "yaml" && Array.isArray(anyE.pos) && typeof anyE.pos[0] === "number") {
    from = anyE.pos[0];
  } else {
    const m = /position (\d+)/.exec(msg);
    if (m) from = Math.min(text.length, Number(m[1]));
  }
  return { severity: "error", message: msg.replace(/\s+in JSON.*/, ""), path: "", from, to: Math.min(text.length, from + 1) };
}

/** Re-serialize a parsed document into the target format (used by the JSON/YAML toggle). */
export function serialize(doc: unknown, format: Format): string {
  return format === "yaml" ? stringifyYaml(doc) : JSON.stringify(doc, null, 2);
}

function majorOf(doc: unknown): "4" | "3" | null {
  const v = (doc as { openapi?: unknown; swagger?: unknown } | null)?.openapi;
  if (typeof v === "string") {
    if (v.startsWith("4")) return "4";
    if (v.startsWith("3")) return "3";
  }
  return null;
}

export function analyze(text: string, format: Format): Analysis {
  const { doc, error } = parseSource(text, format);
  if (!doc || typeof doc !== "object") {
    return { doc: null, parseOk: !error, valid: false, issues: error ? [error] : [], grade: null, major: null };
  }
  const major = majorOf(doc);
  const issues: Issue[] = [];
  const v = validateDocument(doc);
  if (!v.valid) {
    for (const err of v.errors) {
      const { from, to } = locate(text, err.path, format);
      issues.push({ severity: "error", message: err.message, path: err.path, from, to });
    }
  }
  let grade: Grade | null = null;
  if (v.valid) {
    try { grade = auditDocument(doc as never).grade; } catch { /* audit is best-effort */ }
  }
  return { doc, parseOk: true, valid: v.valid, issues, grade, major };
}

/**
 * Best-effort source locator: walk the JSON-Pointer's segments and advance through the text to the deepest matching
 * quoted key, so a validation error can paint a gutter marker near the offending node. Honest about its limits — when
 * a segment isn't found as a literal key (arrays, YAML block style) it stops at the deepest match it did find, and the
 * bottom diagnostics list (which always shows the full path) remains the source of truth.
 */
export function locate(text: string, pointer: string, _format: Format): { from: number; to: number } {
  if (!pointer || pointer === "/" || pointer === "#") return { from: 0, to: 0 };
  const segs = pointer.replace(/^#/, "").split("/").filter(Boolean).map((s) => s.replace(/~1/g, "/").replace(/~0/g, "~"));
  let idx = 0;
  let hit = 0;
  for (const seg of segs) {
    if (/^\d+$/.test(seg)) continue; // array index — no key token to find
    const re = new RegExp('"' + seg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '"');
    const m = re.exec(text.slice(idx));
    if (m) { idx += m.index; hit = idx; }
  }
  return { from: hit, to: Math.min(text.length, hit + 1) };
}
