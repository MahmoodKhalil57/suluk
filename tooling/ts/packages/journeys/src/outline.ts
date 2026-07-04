/**
 * Scenario Outline generator (C040 P1; C094 service-authored steps). Per operation, project a Gherkin `Scenario Outline:` whose
 * `Examples:` columns are the request's CLIENT-FACING input fields (origin `input` or `sourced`; `computed`/server-set fields
 * are dropped — a client never sends them), and whose first seed row comes from the C041-origin-aware resolver:
 *   • an `input` cell  → a deterministic synthesized value the tester edits;
 *   • a `sourced` cell → the WIREABLE TOKEN `<op.select>` (e.g. `<createSubscription.id>`), not a value — so the tester
 *     sees it is wired from a prior step, and the runnable emitter resolves it via `resolveSourced` (the follow-on).
 *
 * C094: the scenario is now RICH, not a flat `When … / Then it succeeds`. When a service pipeline authored steps
 * (`x-suluk-scenario`), the outline uses the AUTHORED Given preconditions + the authored (or derived) When + the success Then +
 * any authored outcome Thens; and for every declared DOMAIN-error response it appends a NEGATIVE `Scenario:` (the same When + the
 * bindable failure Then), leaving the failure precondition as an author TODO. The tester EXPANDS the table / fills the TODO; the
 * binder + emitter then run each. This is an authoring surface, so it lives on the VALUE side (it imports the synth).
 */
import type { OpenAPIv4Document } from "@suluk/core";
import { describeInputs, resolveExample, type FieldOrigin, type JsonSchema } from "@suluk/examples";
import { generateVocabulary, opHandle, NEGATIVE_THEN } from "./vocabulary";

export interface OutlineColumn {
  name: string;
  origin: FieldOrigin;
  /** the seed cell for the first Examples row: a synthesized value (`input`) or a `<op.select>` wiring token (`sourced`). */
  seed: string;
}

export interface ScenarioOutline {
  /** the operation's v4 by-name handle. */
  op: string;
  method: string;
  uri: string;
  /** the `When` step text (keyword stripped) — the authored phrase if present, else the contract-derived one. */
  whenPhrase: string;
  /** authored Given preconditions (keyword stripped) — includes the roles-derived "I am a signed-in user". */
  givens: string[];
  /** success + authored outcome Thens (keyword stripped). */
  thens: string[];
  /** one bindable NEGATIVE outcome per declared domain-error status (keyword stripped). */
  negatives: { status: string; then: string }[];
  /** client-facing input columns (computed fields dropped). Empty ⇒ a plain Scenario, no Examples table. */
  columns: OutlineColumn[];
}

interface RawReq {
  method: string;
  contentSchema?: unknown;
  parameterSchema?: { body?: unknown };
  responses?: Record<string, unknown>;
  ["x-suluk-scenario"]?: { role: "given" | "when" | "then"; text: string }[];
}

/** Escape a synthesized value for a Gherkin table cell. */
function cell(v: unknown): string {
  const s = typeof v === "string" ? v : typeof v === "number" || typeof v === "boolean" ? String(v) : JSON.stringify(v ?? null);
  return s.replace(/\\/g, "\\\\").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

/** Build the structured outlines for every operation. */
export function buildScenarioOutlines(doc: OpenAPIv4Document): ScenarioOutline[] {
  // the derived When (contract's OWN generated phrase, so a coarse outline still BINDS); an authored When overrides it below.
  const whenByHandle = new Map(generateVocabulary(doc).steps.filter((s) => s.kind === "when").map((s) => [s.handle, s.phrase.replace(/^When\s+/i, "")]));
  const outlines: ScenarioOutline[] = [];
  for (const [uri, piRaw] of Object.entries(doc.paths ?? {})) {
    const pi = piRaw as { requests?: Record<string, RawReq> };
    for (const [name, req] of Object.entries(pi.requests ?? {})) {
      const authored = req["x-suluk-scenario"] ?? [];
      const givens = authored.filter((s) => s.role === "given").map((s) => s.text);
      const authoredWhen = authored.find((s) => s.role === "when")?.text;
      const whenPhrase = authoredWhen ?? whenByHandle.get(opHandle(name, uri)) ?? `I ${name}`;
      const statuses = Object.keys(req.responses ?? {});
      // any 2xx ⇒ a bindable success (matches vocabulary.ts's palette). No 2xx (only errors) ⇒ NO fabricated success Then.
      const successThen = statuses.some((s) => /^2\d\d$/.test(s)) ? ["it succeeds"] : [];
      const thens = [...successThen, ...authored.filter((s) => s.role === "then").map((s) => s.text)];
      const negatives = statuses
        .filter((s) => NEGATIVE_THEN[s])
        .map((s) => ({ status: s, then: NEGATIVE_THEN[s].replace(/^Then\s+/i, "") }));

      const body = (req.contentSchema ?? req.parameterSchema?.body) as JsonSchema | undefined;
      const props = (body?.properties ?? {}) as Record<string, JsonSchema>;
      const columns: OutlineColumn[] = [];
      for (const d of describeInputs(body)) {
        if (d.origin === "computed") continue; // a client never sends a server-computed field
        const seed =
          d.origin === "sourced"
            ? `<${d.source ? `${d.source.op}.${d.source.select ?? "id"}` : d.name}>` // wired, not a value
            : cell(resolveExample(props[d.name], {}, d.name, { direction: "request" }).value);
        columns.push({ name: d.name, origin: d.origin, seed });
      }
      outlines.push({ op: name, method: req.method.toLowerCase(), uri, whenPhrase, givens, thens, negatives, columns });
    }
  }
  return outlines;
}

/** Render a left-aligned, padded Gherkin table (6-space indent, matching the step indent + 2). */
function renderTable(headers: string[], rows: string[][]): string {
  const widths = headers.map((h, i) => Math.max(h.length, ...rows.map((r) => (r[i] ?? "").length)));
  const line = (cells: string[]) => "      | " + cells.map((c, i) => (c ?? "").padEnd(widths[i])).join(" | ") + " |";
  return [line(headers), ...rows.map(line)].join("\n");
}

/** Render a Given/When/Then block: `Given a` / `And b` / `When c` / `Then d` / `And e` (And/But fold into the prior keyword). */
function renderSteps(givens: string[], when: string, thens: string[]): string {
  const lines: string[] = [];
  givens.forEach((g, i) => lines.push(`    ${i === 0 ? "Given" : "And"} ${g}`));
  lines.push(`    When ${when}`);
  thens.forEach((t, i) => lines.push(`    ${i === 0 ? "Then" : "And"} ${t}`));
  return lines.join("\n");
}

export interface OutlineRenderOptions {
  /** only render these operations (by name); default all. */
  only?: string[];
  feature?: string;
}

/**
 * Render the generated outlines as a `.feature` SIDECAR a tester expands. A column-bearing op becomes a `Scenario Outline:` +
 * a one-row `Examples:` table; a body-less op becomes a plain `Scenario:`. Each declared domain-error response appends a
 * NEGATIVE `Scenario:` (same When + the failure Then, with a `# Given …` TODO for the precondition the author supplies).
 */
export function renderScenarioOutlines(doc: OpenAPIv4Document, opts: OutlineRenderOptions = {}): string {
  const title = opts.feature ?? `${doc.info?.title ?? "API"} — generated scenario outlines (expand the Examples rows)`;
  const want = opts.only ? new Set(opts.only) : null;
  const blocks = buildScenarioOutlines(doc)
    .filter((o) => !want || want.has(o.op))
    .flatMap((o) => {
      const head = `  Scenario${o.columns.length ? " Outline" : ""}: ${o.op}\n${renderSteps(o.givens, o.whenPhrase, o.thens)}`;
      const positive = o.columns.length
        ? `${head}\n\n    Examples:\n${renderTable(o.columns.map((c) => c.name), [o.columns.map((c) => c.seed)])}`
        : head;
      // one negative Scenario per domain-error status — the auth Given carries over; the FAILURE precondition is an author TODO.
      const authGivens = o.givens.filter((g) => /\b(sign|signed|auth|logged)\b/i.test(g));
      const negatives = o.negatives.map((n) => {
        const pre = authGivens.map((g, i) => `    ${i === 0 ? "Given" : "And"} ${g}`);
        return `  Scenario: ${o.op} — ${n.then}\n${[...pre, "    # Given the precondition that triggers this failure", `    When ${o.whenPhrase}`, `    Then ${n.then}`].join("\n")}`;
      });
      return [positive, ...negatives];
    });
  return `Feature: ${title}\n\n${blocks.join("\n\n")}\n`;
}
