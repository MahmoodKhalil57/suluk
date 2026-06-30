/**
 * Promote-into-Zod (C040, P4). A tester marks an `Examples:` block `@public`; this lifts the block's first row into the
 * matching Zod schema's source as `.meta({ examples: [ … ] })`, provenance-stamped — so Zod stays the LITERAL home for
 * every example (the operator's fork), and the promoted value flows into the rendered docs as the request `.example`.
 *
 * SOURCE-WRITE SAFETY (this edits the maintainer's source file): the edit is MARKED (`@suluk-public`), IDEMPOTENT
 * (re-promoting replaces the marked block, never double-appends), and NEVER CLOBBERS a hand-authored example (if the
 * schema already carries an unmarked top-level `.meta({ examples })`, it REFUSES and asks the maintainer to resolve).
 * The functions here are PURE (string in → string out); the consumer's bin runs `mizan_check_action_safety` before
 * writing and the maintainer reviews the git diff. Reuses @suluk/examples' coercion shape; never invents a value.
 */
import type { Feature } from "./gherkin";
import type { JsonSchema } from "@suluk/examples";

const PUBLIC_MARK = "@suluk-public";

export interface PublicExampleRow {
  scenario: string;
  headers: string[];
  /** the FIRST row of the `@public`-tagged Examples block — the canonical public example. */
  row: string[];
}

/** Every `@public`-tagged Examples block's first row (the tester's curated public example). Pure. */
export function extractPublicRows(features: Feature[]): PublicExampleRow[] {
  const out: PublicExampleRow[] = [];
  for (const f of features) {
    for (const sc of f.scenarios) {
      const ex = sc.examples;
      const isPublic = !!ex && (ex.tags?.includes("public") || sc.tags?.includes("public"));
      if (ex && isPublic && ex.headers.length && ex.rows.length) {
        out.push({ scenario: sc.name, headers: ex.headers, row: ex.rows[0] });
      }
    }
  }
  return out;
}

/** Coerce a table cell to a concrete value by the field's declared type (string default). */
function coerce(cell: string, fieldSchema?: JsonSchema): unknown {
  const t = fieldSchema && typeof fieldSchema === "object" ? fieldSchema.type : undefined;
  const type = Array.isArray(t) ? t[0] : t;
  if ((type === "integer" || type === "number") && cell.trim() !== "" && Number.isFinite(Number(cell))) return Number(cell);
  if (type === "boolean" && (cell === "true" || cell === "false")) return cell === "true";
  return cell;
}

/**
 * Build a concrete public example object from a row, coercing by the body schema's field types. A WIRING TOKEN cell
 * (`<op.select>`) is skipped — a public docs example holds concrete values, not a chaining instruction.
 */
export function buildExampleObject(headers: string[], row: string[], bodySchema?: JsonSchema): Record<string, unknown> {
  const props = (bodySchema?.properties ?? {}) as Record<string, JsonSchema>;
  const out: Record<string, unknown> = {};
  headers.forEach((h, i) => {
    const cell = (row[i] ?? "").trim();
    if (/^<[^>]+>$/.test(cell)) return; // a sourced wiring token is not a concrete public value
    out[h] = coerce(cell, props[h]);
  });
  return out;
}

// ---- the source-editing core (string-aware paren/bracket scanning; never regex-balances JSON) ----

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** From `(` at `open`, the index of the matching `)`, skipping string literals. -1 if unbalanced. */
function matchParen(text: string, open: number): number {
  let depth = 0;
  let str: string | null = null;
  for (let i = open; i < text.length; i++) {
    const ch = text[i];
    if (str) {
      if (ch === "\\") i++;
      else if (ch === str) str = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") str = ch;
    else if (ch === "(") depth++;
    else if (ch === ")" && --depth === 0) return i;
  }
  return -1;
}

/** The index of the top-level `;` ending the expression that starts at `from`, skipping strings + nested brackets. */
function statementEnd(text: string, from: number): number {
  let depth = 0;
  let str: string | null = null;
  for (let i = from; i < text.length; i++) {
    const ch = text[i];
    if (str) {
      if (ch === "\\") i++;
      else if (ch === str) str = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") str = ch;
    else if (ch === "(" || ch === "{" || ch === "[") depth++;
    else if (ch === ")" || ch === "}" || ch === "]") depth--;
    else if (ch === ";" && depth === 0) return i;
  }
  return -1;
}

/** The LAST top-level `.meta(…)` call in `expr` (depth 0 — not a property's `.meta`), or null. */
function topLevelMeta(expr: string): { start: number; end: number; marked: boolean; hasExamples: boolean } | null {
  let depth = 0;
  let str: string | null = null;
  let last: { start: number; end: number; marked: boolean; hasExamples: boolean } | null = null;
  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (str) {
      if (ch === "\\") i++;
      else if (ch === str) str = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      str = ch;
      continue;
    }
    if (ch === "." && depth === 0 && expr.startsWith(".meta(", i)) {
      const end = matchParen(expr, i + 5);
      if (end > 0) {
        const content = expr.slice(i, end + 1);
        last = { start: i, end, marked: content.includes(PUBLIC_MARK), hasExamples: /\bexamples\b/.test(content) };
        i = end;
        continue;
      }
    }
    if (ch === "(" || ch === "{" || ch === "[") depth++;
    else if (ch === ")" || ch === "}" || ch === "]") depth--;
  }
  return last;
}

const renderMeta = (example: unknown, provenance: string) => `.meta(/* ${PUBLIC_MARK}: ${provenance} */ { examples: [${JSON.stringify(example)}] })`;

export interface PromoteResult {
  source: string;
  changed: boolean;
  reason: string;
}

/**
 * Promote `example` into the source of the Zod schema bound to `const <schemaVar> = …`. Idempotent (re-promote replaces
 * the marked block), marked, and refuses to clobber a hand-authored top-level `.meta({ examples })`.
 */
export function promoteExampleIntoZod(source: string, schemaVar: string, example: unknown, provenance: string): PromoteResult {
  const decl = new RegExp(`(^|[\\n;{])\\s*(export\\s+)?const\\s+${escapeRe(schemaVar)}\\s*=`);
  const m = decl.exec(source);
  if (!m) return { source, changed: false, reason: `schema \`${schemaVar}\` not found` };
  const eqIdx = m.index + m[0].length - 1; // the "="
  const exprStart = eqIdx + 1;
  const semi = statementEnd(source, exprStart);
  if (semi < 0) return { source, changed: false, reason: `could not find the end of \`${schemaVar}\`'s declaration` };

  const expr = source.slice(exprStart, semi);
  const meta = renderMeta(example, provenance);
  const top = topLevelMeta(expr);

  let newExpr: string;
  if (top?.marked) {
    newExpr = expr.slice(0, top.start) + meta + expr.slice(top.end + 1); // idempotent replace of the promoted block
  } else if (top?.hasExamples) {
    return { source, changed: false, reason: `\`${schemaVar}\` already has a hand-authored .meta({ examples }) — not clobbering; merge the public example manually` };
  } else if (top) {
    newExpr = expr.slice(0, top.end + 1) + " " + meta + expr.slice(top.end + 1); // append after a non-example .meta (merges safely)
  } else {
    const trimmed = expr.replace(/\s+$/, "").length;
    newExpr = expr.slice(0, trimmed) + meta + expr.slice(trimmed);
  }

  if (newExpr === expr) return { source, changed: false, reason: "no change" };
  return {
    source: source.slice(0, exprStart) + newExpr + source.slice(semi),
    changed: true,
    reason: top?.marked ? `updated the promoted example on \`${schemaVar}\`` : `promoted a public example into \`${schemaVar}\``,
  };
}

export interface PromoteTarget {
  /** the Zod `const` name to edit. */
  schemaVar: string;
  /** the op's request body schema (for typed cell coercion); optional. */
  bodySchema?: JsonSchema;
}

export interface PromoteFeatureResult {
  source: string;
  applied: { scenario: string; schemaVar: string; reason: string }[];
  skipped: { scenario: string; reason: string }[];
}

/**
 * Orchestrate promotion for a whole feature set: for each `@public` Examples row, resolve its target (the consumer maps
 * scenario → schemaVar + body schema — the app knows that wiring), build the example, and apply it. Adapter-seam shaped.
 */
export function promoteFeatureExamples(
  source: string,
  features: Feature[],
  resolveTarget: (scenario: string) => PromoteTarget | null,
  provenancePrefix = "promoted from",
): PromoteFeatureResult {
  let src = source;
  const applied: PromoteFeatureResult["applied"] = [];
  const skipped: PromoteFeatureResult["skipped"] = [];
  for (const pub of extractPublicRows(features)) {
    const target = resolveTarget(pub.scenario);
    if (!target) {
      skipped.push({ scenario: pub.scenario, reason: "no target schema resolved for this scenario" });
      continue;
    }
    const example = buildExampleObject(pub.headers, pub.row, target.bodySchema);
    const r = promoteExampleIntoZod(src, target.schemaVar, example, `${provenancePrefix} ${pub.scenario}`);
    if (r.changed) {
      src = r.source;
      applied.push({ scenario: pub.scenario, schemaVar: target.schemaVar, reason: r.reason });
    } else {
      skipped.push({ scenario: pub.scenario, reason: r.reason });
    }
  }
  return { source: src, applied, skipped };
}
