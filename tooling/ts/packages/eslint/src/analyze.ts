/**
 * Pure detection core for the tier-composition rule — separated from the ESLint wrapper so it is unit-testable WITHOUT
 * an ESLint / astro-parser harness (Workers-safe, zero deps). Given an `.astro` source + per-metric budgets, it returns
 * the violations: native HTML elements, `<script>` / `<style>` blocks, inline `on*=` handlers, and logic in the `---`
 * frontmatter that EXCEED their budget. The tier discipline: pages & sections compose; markup belongs DOWN in a block,
 * logic in an extracted controller. Astro's page-bound `getStaticPaths` is exempt by default (it can't live elsewhere).
 *
 * Detection mirrors the original toolfactory `check-ui-complexity` regexes; the generalization is the per-metric budget
 * (default 0 = composition-only) + a configurable ignore-tag set + the getStaticPaths toggle. Length-preserving masking
 * keeps match indices aligned to the original source so the ESLint wrapper can report at the exact location.
 */

export type Metric = "native" | "script" | "style" | "handler" | "frontmatter";

export interface CompositionOptions {
  /** Max allowed count per metric before it's a violation (default 0 — pure composition). */
  budgets?: Partial<Record<Metric, number>>;
  /** Lowercase tag names NOT counted as native HTML (framework/control elements). */
  ignoreTags?: string[];
  /** Treat Astro's page-bound `getStaticPaths` as allowed page-level logic, exempt from the frontmatter budget (default true). */
  allowGetStaticPaths?: boolean;
}

export interface Violation {
  metric: Metric;
  /** Char offset into the original source (for the ESLint wrapper's getLocFromIndex). */
  index: number;
  length: number;
  /** Message interpolation data: tag (native), attr (handler), or token (frontmatter). */
  data: { tag?: string; attr?: string; token?: string };
}

const DEFAULT_IGNORE = ["slot", "script", "style", "template", "fragment"];
const DEFAULT_BUDGETS: Record<Metric, number> = { native: 0, script: 0, style: 0, handler: 0, frontmatter: 0 };

/** Replace every non-newline char of a match with a space (length- AND line-preserving) so indices stay aligned. */
const blank = (m: string): string => m.replace(/[^\n]/g, " ");

/** Mask HTML / JSX-expression / block comments across the source. */
const maskComments = (s: string): string =>
  s
    .replace(/<!--[\s\S]*?-->/g, blank)
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, blank)
    .replace(/\/\*[\s\S]*?\*\//g, blank);

/** Mask `<script>…</script>` and `<style>…</style>` bodies (so native-tag scanning ignores their contents). */
const maskScriptStyle = (s: string): string => s.replace(/<script[\s\S]*?<\/script>/gi, blank).replace(/<style[\s\S]*?<\/style>/gi, blank);

/** The frontmatter span between the leading `---` fences, or null if none. */
function frontmatterSpan(src: string): { start: number; end: number; bodyStart: number } | null {
  const m = src.match(/^\s*---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const inner = m[1] ?? "";
  const start = m[0].indexOf(inner);
  return { start, end: start + inner.length, bodyStart: m[0].length };
}

/**
 * Mask a `getStaticPaths` function (declaration + body) — Astro's PAGE-BOUND data-loading contract MUST live in the page
 * module, so its logic is legitimately page-level and exempt. Brace-matched; comments are masked before this runs.
 */
function maskGetStaticPaths(fm: string): string {
  const m = fm.match(/(?:export\s+)?(?:async\s+)?(?:function\s+getStaticPaths\b|const\s+getStaticPaths\s*=)/);
  if (m?.index === undefined) return fm;
  const open = fm.indexOf("{", m.index + m[0].length);
  if (open < 0) return fm;
  let depth = 0;
  let i = open;
  for (; i < fm.length; i++) {
    if (fm[i] === "{") depth++;
    else if (fm[i] === "}" && --depth === 0) {
      i++;
      break;
    }
  }
  return fm.slice(0, m.index) + blank(fm.slice(m.index, i)) + fm.slice(i);
}

/** Collect every violation, then apply each metric's budget (report only the occurrences BEYOND the budget). */
export function analyzeComposition(source: string, options: CompositionOptions = {}): Violation[] {
  const budgets = { ...DEFAULT_BUDGETS, ...(options.budgets ?? {}) };
  const ignore = new Set(options.ignoreTags ?? DEFAULT_IGNORE);
  const allowGsp = options.allowGetStaticPaths ?? true;

  const fm = frontmatterSpan(source);
  const bodyStart = fm ? fm.bodyStart : 0;
  const masked = maskComments(source);
  const tpl = maskScriptStyle(masked); // body with script/style stripped (for native + handler scanning)

  const found: Record<Metric, Violation[]> = { native: [], script: [], style: [], handler: [], frontmatter: [] };

  for (const m of tpl.slice(bodyStart).matchAll(/<([a-z][a-zA-Z0-9-]*)(?=[\s/>])/g)) {
    if (m[1] && !ignore.has(m[1])) found.native.push({ metric: "native", index: bodyStart + (m.index ?? 0), length: m[0].length, data: { tag: m[1] } });
  }
  for (const m of tpl.slice(bodyStart).matchAll(/\s(on[A-Za-z]+)\s*=/g))
    found.handler.push({ metric: "handler", index: bodyStart + (m.index ?? 0) + 1, length: (m[1] ?? "").length, data: { attr: m[1] } });
  for (const m of masked.slice(bodyStart).matchAll(/<script[\s>]/gi)) found.script.push({ metric: "script", index: bodyStart + (m.index ?? 0), length: 7, data: {} });
  for (const m of masked.slice(bodyStart).matchAll(/<style[\s>]/gi)) found.style.push({ metric: "style", index: bodyStart + (m.index ?? 0), length: 6, data: {} });

  if (fm) {
    const logic = /\b(if|for|while|switch|try|catch)\s*\(|\bawait\b|\bfunction\b|=>|\.(map|filter|reduce|forEach|find|sort|flatMap)\s*\(|\bfetch\s*\(/g;
    const region = allowGsp ? maskGetStaticPaths(masked.slice(fm.start, fm.end)) : masked.slice(fm.start, fm.end);
    for (const m of region.matchAll(logic))
      found.frontmatter.push({ metric: "frontmatter", index: fm.start + (m.index ?? 0), length: m[0].length, data: { token: m[0].trim() } });
  }

  const out: Violation[] = [];
  for (const metric of Object.keys(found) as Metric[]) {
    const occ = found[metric];
    if (occ.length > budgets[metric]) out.push(...occ.slice(budgets[metric]));
  }
  return out.sort((a, b) => a.index - b.index);
}
