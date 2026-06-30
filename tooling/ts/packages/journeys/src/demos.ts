/**
 * Demo collections (C042): a bound feature set → a Bruno OR Postman collection a tester clicks through to showcase a
 * feature START-TO-END on a LIVE (production) environment during a call.
 *
 * Same binding as the runnable emitter (C038/C040), a DIFFERENT lowering: each bound `When` becomes a raw HTTP request
 * (method + `{{baseUrl}}`-prefixed path + auth header + JSON body) rather than a typed `client.<acc>()` call. The body is
 * built from the scenario's first Examples row when present, else SYNTHESIZED from the schema (origin-aware) — so a demo
 * is concrete without a table. A `sourced` field becomes request CHAINING: the SOURCE request captures the field into a
 * collection variable (Postman `pm.collectionVariables.set` / Bruno `bru.setVar`) and the consumer references it via
 * `{{var}}` — the live-call equivalent of `resolveSourced`. `baseUrl` + `token` are collection variables the presenter
 * sets to point at prod. Pure (collection text out); a downstream consumer of the contract, never read by the matcher.
 */
import type { OpenAPIv4Document } from "@suluk/core";
import { resolveOps, type OpInfo } from "@suluk/sdk";
import { describeInputs, synthesize, type JsonSchema } from "@suluk/examples";
import { bindFeatures, type BindOptions } from "./bind";
import type { Feature } from "./gherkin";
import type { Vocabulary } from "./vocabulary";

/** A request value: a concrete literal, or a `{{var}}` reference to a captured upstream response field. */
export type DemoValue = { kind: "literal"; value: unknown } | { kind: "var"; name: string };
/** Capture `res.<from>` of this request into the collection variable `var` (for downstream chaining). */
export interface DemoCapture {
  var: string;
  from: string;
}
export interface DemoRequest {
  /** the human label (the op name). */
  label: string;
  /** the op's by-name handle name (for chaining resolution). */
  name: string;
  method: string;
  /** path with `{param}` substituted to a row value or a `{{param}}` variable; prefixed with `{{baseUrl}}` at render. */
  path: string;
  needsAuth: boolean;
  body?: Record<string, DemoValue>;
  captures: DemoCapture[];
}
export interface DemoScenario {
  name: string;
  requests: DemoRequest[];
}

const SOURCED_CELL = /^<([A-Za-z_][\w]*)\.(.+)>$/;
const varName = (op: string, select: string) => `${op}_${select.replace(/[^A-Za-z0-9]+/g, "_")}`.replace(/_+$/, "");

function coerce(cell: string, fieldSchema?: JsonSchema): unknown {
  const t = fieldSchema && typeof fieldSchema === "object" ? fieldSchema.type : undefined;
  const type = Array.isArray(t) ? t[0] : t;
  if ((type === "integer" || type === "number") && cell.trim() !== "" && Number.isFinite(Number(cell))) return Number(cell);
  if (type === "boolean" && (cell === "true" || cell === "false")) return cell === "true";
  return cell;
}

interface Ref {
  op: string;
  select: string;
  var: string;
}

/** Build the JSON body for a request from the Examples row (when present) else from the schema (synthesized). */
function buildBody(op: OpInfo, cells: Record<string, string> | null): { body?: Record<string, DemoValue>; refs: Ref[] } {
  const bodyRaw = op.bodyRaw as JsonSchema | undefined;
  if (!bodyRaw || typeof bodyRaw !== "object") return { refs: [] };
  const props = (bodyRaw.properties ?? {}) as Record<string, JsonSchema>;
  const descs = describeInputs(bodyRaw);
  if (!descs.length) return { refs: [] };
  const body: Record<string, DemoValue> = {};
  const refs: Ref[] = [];
  for (const d of descs) {
    if (d.origin === "computed") continue; // a client never sends a server-computed field
    const cell = cells?.[d.name];
    const token = cell ? SOURCED_CELL.exec(cell.trim()) : null;
    if (token) {
      const v = varName(token[1], token[2]);
      body[d.name] = { kind: "var", name: v };
      refs.push({ op: token[1], select: token[2], var: v });
    } else if (cell !== undefined && cell !== "") {
      body[d.name] = { kind: "literal", value: coerce(cell, props[d.name]) };
    } else if (d.origin === "sourced" && d.source) {
      const v = varName(d.source.op, d.source.select ?? "id");
      body[d.name] = { kind: "var", name: v };
      refs.push({ op: d.source.op, select: d.source.select ?? "id", var: v });
    } else {
      body[d.name] = { kind: "literal", value: synthesize(props[d.name], d.name, { direction: "request" }) };
    }
  }
  return { body, refs };
}

function substitutePath(uri: string, cells: Record<string, string> | null): string {
  const path = uri.replace(/^\/?/, "/");
  return path.replace(/\{\+?([^}?&]+)\}/g, (_, p) => {
    const cell = cells?.[p];
    return cell && cell !== "" && !SOURCED_CELL.test(cell) ? cell : `{{${p}}}`;
  });
}

export interface CompileDemoOptions extends BindOptions {}

/** Compile a bound feature set into the demo IR: ordered requests per scenario, with sourced fields wired to captures. */
export function compileDemos(doc: OpenAPIv4Document, vocab: Vocabulary, features: Feature[], opts: CompileDemoOptions = {}): DemoScenario[] {
  const report = bindFeatures(vocab, features, opts);
  const sourceScenarios = features.flatMap((f) => f.scenarios);
  const { ops } = resolveOps(doc);
  const opByHandle = new Map<string, OpInfo>(ops.map((op) => [`${op.name}@${op.uri}`, op]));

  const demos: DemoScenario[] = [];
  for (let i = 0; i < report.scenarios.length; i++) {
    const sc = report.scenarios[i];
    const ex = sourceScenarios[i]?.examples;
    const cells = ex && ex.headers.length && ex.rows.length ? Object.fromEntries(ex.headers.map((h, ci) => [h, ex.rows[0][ci] ?? ""])) : null;

    const requests: DemoRequest[] = [];
    const refsPerReq: Ref[][] = [];
    for (const r of sc.results) {
      if (r.state !== "BOUND" || r.step.kind !== "when") continue;
      const op = opByHandle.get(r.handle);
      if (!op) continue;
      const { body, refs } = buildBody(op, cells);
      requests.push({
        label: op.name,
        name: op.name,
        method: op.method.toUpperCase(),
        path: substitutePath(op.uri, cells),
        needsAuth: op.requires !== "anyone",
        ...(body && Object.keys(body).length ? { body } : {}),
        captures: [],
      });
      refsPerReq.push(refs);
    }

    // resolve chaining: each ref consumed by request `c` is captured by the latest prior request whose op produced it.
    for (let c = 0; c < requests.length; c++) {
      for (const ref of refsPerReq[c]) {
        for (let s = c - 1; s >= 0; s--) {
          if (requests[s].name === ref.op) {
            if (!requests[s].captures.some((cap) => cap.var === ref.var)) requests[s].captures.push({ var: ref.var, from: ref.select });
            break;
          }
        }
      }
    }

    if (requests.length) demos.push({ name: sc.scenario, requests });
  }
  return demos;
}

// ---------------------------------------------------------------------------------------------------------------------
// Renderers
// ---------------------------------------------------------------------------------------------------------------------

export interface RenderOptions {
  /** collection name (default the doc/feature title or "Demo"). */
  name?: string;
  /** the PROD base URL — the live-call target the tester switches to. */
  baseUrl?: string;
  /** the LOCAL base URL a developer tests against FIRST (the same collection, just a different `baseUrl`). Default a
   *  Cloudflare Workers `wrangler dev` port. */
  localBaseUrl?: string;
}

const DEFAULT_LOCAL = "http://localhost:8787";

const slug = (s: string) => s.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase() || "step";

/** Render a JSON body where `{{var}}` refs are quoted strings (live-call chaining) and literals are JSON. */
function renderBodyJson(body: Record<string, DemoValue>): string {
  const lines = Object.entries(body).map(([k, v]) => `  ${JSON.stringify(k)}: ${v.kind === "var" ? JSON.stringify(`{{${v.name}}}`) : JSON.stringify(v.value)}`);
  return `{\n${lines.join(",\n")}\n}`;
}

/** Render the demos as a Postman Collection v2.1.0 (a single JSON string). */
export function renderPostman(demos: DemoScenario[], opts: RenderOptions = {}): string {
  const local = opts.localBaseUrl ?? DEFAULT_LOCAL;
  const collection = {
    // `baseUrl` defaults to LOCAL so a fresh import runs against a dev server first; switch it to `{{prodBaseUrl}}` (or
    // a Postman environment) for the live production demo. Same collection, both environments.
    info: { name: opts.name ?? "Demo", schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json" },
    variable: [
      { key: "baseUrl", value: local },
      { key: "localBaseUrl", value: local },
      { key: "prodBaseUrl", value: opts.baseUrl ?? "" },
      { key: "token", value: "" },
    ],
    item: demos.map((sc) => ({
      name: sc.name,
      item: sc.requests.map((req) => {
        const header = [
          ...(req.body ? [{ key: "Content-Type", value: "application/json" }] : []),
          ...(req.needsAuth ? [{ key: "Authorization", value: "Bearer {{token}}" }] : []),
        ];
        const scripts: string[] = [`pm.test("2xx", () => pm.expect(pm.response.code).to.be.below(300));`];
        for (const cap of req.captures) scripts.push(`pm.collectionVariables.set(${JSON.stringify(cap.var)}, pm.response.json().${cap.from});`);
        return {
          name: req.label,
          event: scripts.length ? [{ listen: "test", script: { type: "text/javascript", exec: scripts } }] : [],
          request: {
            method: req.method,
            header,
            url: { raw: `{{baseUrl}}${req.path}`, host: ["{{baseUrl}}"], path: req.path.split("/").filter(Boolean) },
            ...(req.body ? { body: { mode: "raw", raw: renderBodyJson(req.body), options: { raw: { language: "json" } } } } : {}),
          },
        };
      }),
    })),
  };
  return JSON.stringify(collection, null, 2);
}

/** Render the demos as a Bruno collection — a map of relative file path → `.bru`/json content the consumer writes. */
export function renderBruno(demos: DemoScenario[], opts: RenderOptions = {}): Record<string, string> {
  const name = opts.name ?? "Demo";
  const local = opts.localBaseUrl ?? DEFAULT_LOCAL;
  // TWO environments, ONE collection: a developer runs `local` first, the presenter switches to `prod` for the live call.
  const files: Record<string, string> = {
    "bruno.json": JSON.stringify({ version: "1", name, type: "collection", ignore: ["node_modules", ".git"] }, null, 2),
    "environments/local.bru": `vars {\n  baseUrl: ${local}\n  token: \n}\n`,
    "environments/prod.bru": `vars {\n  baseUrl: ${opts.baseUrl ?? ""}\n  token: \n}\n`,
  };
  for (const sc of demos) {
    const folder = slug(sc.name);
    sc.requests.forEach((req, i) => {
      const seq = i + 1;
      const blocks: string[] = [
        `meta {\n  name: ${req.label}\n  type: http\n  seq: ${seq}\n}`,
        `${req.method.toLowerCase()} {\n  url: {{baseUrl}}${req.path}\n${req.body ? "  body: json\n" : ""}${req.needsAuth ? "  auth: bearer\n" : ""}}`,
      ];
      if (req.body) blocks.push(`headers {\n  Content-Type: application/json\n}`);
      if (req.needsAuth) blocks.push(`auth:bearer {\n  token: {{token}}\n}`);
      if (req.body) blocks.push(`body:json {\n${renderBodyJson(req.body).split("\n").map((l) => "  " + l).join("\n")}\n}`);
      blocks.push(`assert {\n  res.status: lt 300\n}`);
      if (req.captures.length) blocks.push(`script:post-response {\n${req.captures.map((c) => `  bru.setVar(${JSON.stringify(c.var)}, res.body.${c.from});`).join("\n")}\n}`);
      files[`${folder}/${seq}-${slug(req.label)}.bru`] = blocks.join("\n\n") + "\n";
    });
  }
  return files;
}
