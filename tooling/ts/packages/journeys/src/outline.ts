/**
 * Scenario Outline generator (C040, P1). Per operation, project a Gherkin `Scenario Outline:` whose `Examples:` columns
 * are the request's CLIENT-FACING input fields (origin `input` or `sourced`; `computed`/server-set fields are dropped —
 * a client never sends them), and whose first seed row comes from the C041-origin-aware resolver:
 *   • an `input` cell  → a deterministic synthesized value the tester edits;
 *   • a `sourced` cell → the WIREABLE TOKEN `<op.select>` (e.g. `<createSubscription.id>`), not a value — so the tester
 *     sees it is wired from a prior step, and the runnable emitter resolves it via `resolveSourced` (the follow-on).
 *
 * The tester EXPANDS the table (adds rows / edits cells); the binder + emitter then run each row. This is an authoring
 * surface, so it lives on the VALUE side (it imports the synth) — never read by the matcher.
 */
import type { OpenAPIv4Document } from "@suluk/core";
import { describeInputs, resolveExample, type FieldOrigin, type JsonSchema } from "@suluk/examples";

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
  /** the `When` step text (placeholders reference the Examples columns). */
  whenPhrase: string;
  /** client-facing input columns (computed fields dropped). Empty ⇒ a plain Scenario, no Examples table. */
  columns: OutlineColumn[];
}

interface RawReq {
  method: string;
  contentSchema?: unknown;
  parameterSchema?: { body?: unknown };
}

/** Escape a synthesized value for a Gherkin table cell. */
function cell(v: unknown): string {
  const s = typeof v === "string" ? v : typeof v === "number" || typeof v === "boolean" ? String(v) : JSON.stringify(v ?? null);
  return s.replace(/\\/g, "\\\\").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

/** Build the structured outlines for every operation that has a client-facing request body. */
export function buildScenarioOutlines(doc: OpenAPIv4Document): ScenarioOutline[] {
  const outlines: ScenarioOutline[] = [];
  for (const [uri, piRaw] of Object.entries(doc.paths ?? {})) {
    const pi = piRaw as { requests?: Record<string, RawReq> };
    for (const [name, req] of Object.entries(pi.requests ?? {})) {
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
      const withClause = columns.length ? ` with ${columns.map((c) => `${c.name}=<${c.name}>`).join(" ")}` : "";
      outlines.push({ op: name, method: req.method.toLowerCase(), uri, whenPhrase: `I ${name}${withClause}`, columns });
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

export interface OutlineRenderOptions {
  /** only render these operations (by name); default all. */
  only?: string[];
  feature?: string;
}

/**
 * Render the generated outlines as a `.feature` SIDECAR a tester expands. A column-bearing op becomes a `Scenario
 * Outline:` + a one-row `Examples:` table; a body-less op becomes a plain `Scenario:`.
 */
export function renderScenarioOutlines(doc: OpenAPIv4Document, opts: OutlineRenderOptions = {}): string {
  const title = opts.feature ?? `${doc.info?.title ?? "API"} — generated scenario outlines (expand the Examples rows)`;
  const want = opts.only ? new Set(opts.only) : null;
  const blocks = buildScenarioOutlines(doc)
    .filter((o) => !want || want.has(o.op))
    .map((o) => {
      const head = `  Scenario${o.columns.length ? " Outline" : ""}: ${o.op}\n    When ${o.whenPhrase}\n    Then it succeeds`;
      if (!o.columns.length) return head;
      const table = renderTable(o.columns.map((c) => c.name), [o.columns.map((c) => c.seed)]);
      return `${head}\n\n    Examples:\n${table}`;
    });
  return `Feature: ${title}\n\n${blocks.join("\n\n")}\n`;
}
