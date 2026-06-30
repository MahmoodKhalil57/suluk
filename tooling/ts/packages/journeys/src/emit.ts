/**
 * The RUNNABLE emitter (C038 + C040-P1): a bound feature set → a self-contained `bun:test` suite that drives each
 * scenario through the consumer's GENERATED @suluk/sdk client (+ its reactive stores), against a LIVE deployment.
 *
 * Why the SDK client and not raw HTTP (the distinction from @suluk/testgen, which calls a raw `fetch(BASE+path)`
 * harness): the SDK client is the SAME one a Suluk frontend ships on, so a green scenario exercises the real frontend
 * DATA-PATH — typed dispatch, input validation, the auth interceptor, response decode, and the C037 store
 * invalidation/refetch. HONEST BOUNDARY (emitted as a literal header in the suite): it tests
 * client + contract + wire + the store data layer, NOT rendered UI / layout / visual — there is no DOM in a bun:test.
 *
 * SCENARIO OUTLINES (C040-P1): a scenario with an `Examples:` table is unrolled to ONE test PER ROW; the bound When op's
 * request body is built FROM THE ROW (an Examples column = a request field of that op, by name). An `input` cell is used
 * as a literal (coerced to the field's type); a `sourced` cell `<op.select>` is RESOLVED from a prior step's captured
 * response via the inlined `pick` (carried-data across a journey — `resolveSourced`'s shape). Each bound When's result
 * is captured under its `op.name`, so a later sourced field chains from it. Where a value isn't supplied (no Examples
 * table, or an op with path/query args not yet outline-wired) the emitter writes a "provide input" placeholder — a real
 * gap, never an invented value (the never-launder-thin discipline).
 *
 * The call site is lowered with @suluk/sdk's OWN `resolveOps` + `clientAccessor` — the single source of accessor
 * identity — so the emitted `client.<ns>.<member>(…)` can NEVER drift from the method `generateSdk` emits.
 */
import type { OpenAPIv4Document } from "@suluk/core";
import { resolveOps, clientAccessor, type OpInfo } from "@suluk/sdk";
import type { Feature } from "./gherkin";
import type { Vocabulary } from "./vocabulary";
import { bindFeatures, type BindOptions } from "./bind";

export interface EmitOptions extends BindOptions {
  /** import specifier for the consumer's generated SDK (default: the consumer's local "./sdk"). */
  clientModule?: string;
  /** named export that creates a client (default: "createClient"). */
  clientFactory?: string;
  /** env var holding the live base URL (default: "SULUK_BASE_URL"). */
  baseUrlEnv?: string;
  /** env var holding a bearer token for authenticated scenarios (default: "SULUK_USER_TOKEN"). */
  tokenEnv?: string;
}

const JS_ID = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const jsKey = (k: string) => (JS_ID.test(k) ? k : JSON.stringify(k));
/** A `sourced` Examples cell: the wiring token `<op.select>` (e.g. `<createSubscription.id>`). */
const SOURCED_CELL = /^<([A-Za-z_][\w]*)\.(.+)>$/;

/** An Examples cell → a TS literal: a `<op.select>` token → `pick(captured,…)`; else coerced by the field's type. */
function cellLiteral(cell: string, fieldSchema: unknown): string {
  const m = SOURCED_CELL.exec(cell.trim());
  if (m) return `pick(captured, ${JSON.stringify(m[1])}, ${JSON.stringify(m[2])})`;
  const t = fieldSchema && typeof fieldSchema === "object" ? (fieldSchema as { type?: unknown }).type : undefined;
  const type = Array.isArray(t) ? t[0] : t;
  if ((type === "integer" || type === "number") && cell.trim() !== "" && Number.isFinite(Number(cell))) return String(Number(cell));
  if (type === "boolean" && (cell === "true" || cell === "false")) return cell;
  return JSON.stringify(cell);
}

/** The call args for an outline row, or null if the op needs path/query args (not yet outline-wired → placeholder). */
function buildCallArgs(op: OpInfo, cells: Record<string, string>): string | null {
  if (op.pathParams.length || op.queryRaw != null) return null;
  if (op.bodyRaw == null) return "";
  const props = (op.bodyRaw && typeof op.bodyRaw === "object" ? (op.bodyRaw as { properties?: Record<string, unknown> }).properties : undefined) ?? {};
  const entries: string[] = [];
  for (const [h, cell] of Object.entries(cells)) {
    if (!(h in props)) continue; // a column belonging to ANOTHER When op in a multi-step journey
    entries.push(`${jsKey(h)}: ${cellLiteral(cell, (props as Record<string, unknown>)[h])}`);
  }
  return `{ ${entries.join(", ")} }`;
}

/** Emit a runnable bun:test suite (a string) from a parsed, bound feature set, lowered to the real SDK client. */
export function emitRunnableSuite(doc: OpenAPIv4Document, vocab: Vocabulary, features: Feature[], opts: EmitOptions = {}): string {
  const clientModule = opts.clientModule ?? "./sdk";
  const clientFactory = opts.clientFactory ?? "createClient";
  const baseUrlEnv = opts.baseUrlEnv ?? "SULUK_BASE_URL";
  const tokenEnv = opts.tokenEnv ?? "SULUK_USER_TOKEN";

  const report = bindFeatures(vocab, features, opts);
  // report.scenarios is pushed in feature→scenario order, so it aligns 1:1 with the flattened source scenarios; the
  // source carries the Examples table the binder does not.
  const sourceScenarios = features.flatMap((f) => f.scenarios);
  // accessor identity comes from @suluk/sdk itself, keyed by the STABLE handle (name@uri — neither is mutated by resolveOps).
  const { ops } = resolveOps(doc);
  const opByHandle = new Map<string, OpInfo>(ops.map((op) => [`${op.name}@${op.uri}`, op]));

  const head = [
    "// GENERATED by @suluk/journeys — do not edit by hand; regenerate from the contract + .feature sidecars.",
    "// Coverage: this exercises the frontend DATA-PATH (client + contract + wire + store), NOT rendered UI / visual.",
    `import { test, expect } from "bun:test";`,
    `import { ${clientFactory} } from "${clientModule}";`,
    ``,
    `// resolve a \`sourced\` Examples cell <op.select> from a prior step's captured response (carried-data across a journey).`,
    `const pick = (captured: Record<string, any>, op: string, sel: string) => sel.split(".").reduce((v: any, k) => (v == null ? undefined : v[k]), captured[op]);`,
    ``,
    `const client = ${clientFactory}({`,
    `  baseURL: process.env.${baseUrlEnv},`,
    `  token: () => process.env.${tokenEnv} ?? null, // bearer; cookie auth also works via credentials:"include"`,
    `});`,
    ``,
  ];

  const body: string[] = [];

  /** Emit the bound When calls (+ outcome assertions) for one scenario run. `cells` non-null ⇒ an outline row (build
   *  the body + capture for chaining); null ⇒ the plain path (a "provide input" placeholder). */
  const emitCalls = (results: typeof report.scenarios[number]["results"], cells: Record<string, string> | null) => {
    let n = 0;
    let current: OpInfo | undefined;
    for (const r of results) {
      if (r.state !== "BOUND") continue;
      if (r.step.kind === "when") {
        current = opByHandle.get(r.handle);
        if (!current) {
          body.push(`  // skipped ${r.handle} — not an SDK-surfaced operation (e.g. a webhook); bind via raw HTTP.`);
          continue;
        }
        const acc = clientAccessor(current);
        body.push(`  // ${current.method.toUpperCase()} ${current.uri}${current.requires !== "anyone" ? `  (requires ${current.requires}: set ${tokenEnv})` : ""}`);
        n++;
        if (cells) {
          const args = buildCallArgs(current, cells);
          body.push(args === null
            ? `  const result${n} = await client.${acc}(/* provide input — path/query args not yet outline-wired */);`
            : `  const result${n} = await client.${acc}(${args});`);
          body.push(`  captured[${JSON.stringify(current.name)}] = result${n};`);
        } else {
          body.push(`  const result${n} = await client.${acc}(/* provide input */);`);
        }
      } else if (r.step.kind === "then" && current) {
        if (/succeed/i.test(r.step.text) && n) body.push(`  expect(result${n}).toBeDefined();`);
        if (/refresh/i.test(r.step.text)) for (const key of current.store?.invalidates ?? []) body.push(`  // store: expect $${key} to have refreshed after this mutation`);
      }
    }
  };

  for (let i = 0; i < report.scenarios.length; i++) {
    const sc = report.scenarios[i];
    if (!sc.results.some((r) => r.state === "BOUND" && r.step.kind === "when")) continue;
    const ex = sourceScenarios[i]?.examples;

    if (ex && ex.headers.length && ex.rows.length) {
      // OUTLINE: one test per Examples row, body built from the row + sourced cells chained via `captured`.
      ex.rows.forEach((row, ri) => {
        const cells = Object.fromEntries(ex.headers.map((h, ci) => [h, row[ci] ?? ""]));
        body.push(`test(${JSON.stringify(`${sc.scenario} — example ${ri + 1}`)}, async () => {`);
        body.push(`  const captured: Record<string, any> = {};`);
        emitCalls(sc.results, cells);
        body.push(`});`, ``);
      });
    } else {
      body.push(`test(${JSON.stringify(sc.scenario)}, async () => {`);
      emitCalls(sc.results, null);
      body.push(`});`, ``);
    }
  }

  if (!body.length) body.push("// No scenario bound a When-operation yet — author steps from the generated phrasebook.");
  return head.join("\n") + body.join("\n");
}
