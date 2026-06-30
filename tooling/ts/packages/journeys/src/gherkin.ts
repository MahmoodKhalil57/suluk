/**
 * A minimal, dependency-free Gherkin parser (no cucumber dep; Bun-native like @suluk/sdk / @suluk/testgen).
 *
 * Supports Feature / Rule / Scenario / Given / When / Then / And / But and `#` comments. `And`/`But` inherit the
 * previous step keyword (Given/When/Then) — the resolved keyword is what the binder matches on, never the raw `And`.
 * This is an authoring surface, not a runtime; it parses the SIDECAR `.feature` text (free human prose) that the
 * D1 wall keeps out of the contract.
 */
export type StepKind = "given" | "when" | "then";

export interface FeatureStep {
  /** the RESOLVED keyword (And/But fold into the preceding Given/When/Then). */
  kind: StepKind;
  /** the step text after the keyword. */
  text: string;
  /** the raw line as written (for reporting). */
  raw: string;
  /** 1-based source line number (for file:line hand-offs). */
  line: number;
}

export interface Scenario {
  name: string;
  /** the `Rule:` this scenario sits under, if any. */
  rule?: string;
  steps: FeatureStep[];
  line: number;
  /** tags on this scenario (the leading `@` stripped), e.g. ["public"]. */
  tags?: string[];
  /** the captured `Examples:` table of a Scenario Outline (C040-P1); absent for a plain Scenario. `tags` are from a
   *  `@public`-style line directly above the `Examples:` keyword (C040-P4 promote selection). */
  examples?: { headers: string[]; rows: string[][]; tags?: string[] };
}

export interface Feature {
  feature: string;
  scenarios: Scenario[];
}

// NB: `Scenario Outline` MUST precede `Scenario` — alternation is ordered, else "Scenario Outline: x" matches the
// shorter `Scenario` and mis-parses the name as "Outline: x".
const KW = /^(Feature|Background|Rule|Scenario Outline|Scenario|Given|When|Then|And|But|Examples)\b:?\s*(.*)$/i;

export function parseFeature(src: string): Feature {
  let feature = "";
  let rule: string | undefined;
  let cur: Scenario | null = null;
  let last: StepKind = "given";
  let collectingExamples = false;
  let pendingTags: string[] = [];
  const scenarios: Scenario[] = [];
  const lines = src.split("\n");

  lines.forEach((raw, i) => {
    const t = raw.trim();
    if (!t || t.startsWith("#")) return;

    // a tag line (`@public @smoke …`) — attaches to the NEXT Scenario or Examples block.
    if (t.startsWith("@")) {
      pendingTags.push(...t.split(/\s+/).filter((x) => x.startsWith("@")).map((x) => x.slice(1)));
      return;
    }

    // a `|` table row — captured ONLY while inside an Examples block (a Scenario Outline's table); otherwise ignored.
    if (t.startsWith("|")) {
      const c = cur;
      if (collectingExamples && c?.examples) {
        const cells = t.split("|").slice(1, -1).map((s) => s.trim());
        if (c.examples.headers.length === 0) c.examples.headers = cells;
        else c.examples.rows.push(cells);
      }
      return;
    }

    const m = KW.exec(t);
    if (!m) return;
    const kw = m[1].toLowerCase();
    const rest = m[2];
    switch (kw) {
      case "feature":
        feature = rest;
        collectingExamples = false;
        pendingTags = [];
        return;
      case "rule":
        rule = rest;
        collectingExamples = false;
        pendingTags = [];
        return;
      case "background":
        collectingExamples = false;
        pendingTags = [];
        return;
      case "examples":
        if (cur) {
          cur.examples = { headers: [], rows: [], ...(pendingTags.length ? { tags: pendingTags } : {}) };
          collectingExamples = true;
        }
        pendingTags = [];
        return;
      case "scenario":
      case "scenario outline":
        collectingExamples = false;
        cur = { name: rest, rule, steps: [], line: i + 1, ...(pendingTags.length ? { tags: pendingTags } : {}) };
        scenarios.push(cur);
        pendingTags = [];
        return;
    }
    // a step keyword
    if (!cur) {
      cur = { name: "(unnamed)", rule, steps: [], line: i + 1 };
      scenarios.push(cur);
    }
    const k: StepKind = kw === "given" || kw === "when" || kw === "then" ? (kw as StepKind) : last;
    last = k;
    cur.steps.push({ kind: k, text: rest, raw: t, line: i + 1 });
  });

  return { feature, scenarios };
}
