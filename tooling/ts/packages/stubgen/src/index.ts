/**
 * `@suluk/stubgen` — turn a NEEDS-CONTRACT gap (a tester pre-wrote a scenario the contract can't back yet) into
 * honestly-provisional backend STUBS the maintainer then writes pragmatically.
 *
 * Two halves, per C040-P3:
 *   • the CONTRACT half is GENERIC — a `@suluk/hono` RouteContract literal (method/path/name inferred from the intent;
 *     request Zod inferred from the gap's Examples columns; responses a placeholder), every inference tagged
 *     `// TODO: tighten` — the inferred Zod is LOSSY by construction and the maintainer owns the final schema (never
 *     laundered as authoritative).
 *   • the HANDLER half goes through a `HandlerTarget` ADAPTER SEAM (mirroring @suluk/deploy's DeployProvider / the C034
 *     runtime seam), because the handler idiom is app-specific. The first adapter is `honoEffectTarget` (the toolfactory
 *     Effect + run() + RouteError<name> shape); `honoTarget` is a framework-generic fallback.
 *
 * Zero-dependency + pure (source-text out): @suluk/core never imports this; this imports nothing.
 */

export interface StubField {
  name: string;
  /** the inferred Zod expression, e.g. `z.string()`. */
  zod: string;
  /** the inferred TS type, e.g. `string`. */
  tsType: string;
}

/** The input: a gap the contract cannot back, optionally with the Examples columns that hint the request shape. */
export interface StubGap {
  /** the authored intent — the When step text, e.g. "I refund a charge". */
  intent: string;
  /** the Examples columns (request field names) + an optional sample cell for type inference. */
  fields?: { name: string; sample?: string }[];
  /** explicit overrides (else inferred from `intent`). */
  name?: string;
  method?: string;
  path?: string;
}

/** The resolved, renderable stub. */
export interface StubSpec {
  name: string;
  method: string;
  path: string;
  intent: string;
  fields: StubField[];
}

const STOP = new Set(["a", "an", "the", "my", "our", "to", "of", "for", "with", "from"]);
const VERB_METHOD: Record<string, string> = {
  create: "post", add: "post", post: "post", submit: "post", new: "post", start: "post", send: "post", refund: "post",
  get: "get", view: "get", list: "get", show: "get", fetch: "get", read: "get", see: "get",
  update: "put", edit: "put", change: "put", set: "put",
  delete: "delete", remove: "delete", cancel: "delete",
};

const words = (intent: string) => intent.replace(/^I\s+/i, "").trim().split(/\s+/).filter(Boolean);

function inferName(intent: string): string {
  const w = words(intent).filter((x) => !STOP.has(x.toLowerCase())).map((x) => x.replace(/[^A-Za-z0-9]/g, ""));
  const parts = w.filter(Boolean);
  if (!parts.length) return "operation";
  return parts.map((p, i) => (i === 0 ? p.toLowerCase() : p[0].toUpperCase() + p.slice(1).toLowerCase())).join("");
}

const inferMethod = (intent: string): string => VERB_METHOD[words(intent)[0]?.toLowerCase() ?? ""] ?? "post";

const kebab = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

/** Infer a Zod expression + TS type from a sample cell (string default — honestly-provisional). */
function inferField(name: string, sample?: string): StubField {
  const s = sample?.trim();
  if (s) {
    if (s !== "" && Number.isFinite(Number(s))) return { name, zod: "z.number()", tsType: "number" };
    if (s === "true" || s === "false") return { name, zod: "z.boolean()", tsType: "boolean" };
  }
  return { name, zod: "z.string()", tsType: "string" };
}

/** Resolve a gap to a renderable spec (inferring name/method/path/fields where not given). */
export function stubSpec(gap: StubGap): StubSpec {
  const name = gap.name ?? inferName(gap.intent);
  return {
    name,
    method: (gap.method ?? inferMethod(gap.intent)).toLowerCase(),
    path: gap.path ?? `/${kebab(name)}`,
    intent: gap.intent,
    fields: (gap.fields ?? []).map((f) => inferField(f.name, f.sample)),
  };
}

const jsKey = (k: string) => (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k) ? k : JSON.stringify(k));

/** Render the CONTRACT half — a `@suluk/hono` RouteContract literal to paste into `contractDoc([...])`. */
export function renderContract(spec: StubSpec): string {
  const lines = [
    `// STUB contract (generated from a NEEDS-CONTRACT gap: ${JSON.stringify(spec.intent)}). Tighten Zod + responses, then implement the handler.`,
    `{`,
    `  method: ${JSON.stringify(spec.method)},`,
    `  path: ${JSON.stringify(spec.path)},`,
    `  name: ${JSON.stringify(spec.name)},`,
    `  summary: ${JSON.stringify(`TODO: describe ${spec.name}.`)},`,
  ];
  if (spec.fields.length) {
    lines.push(`  request: { json: z.object({ ${spec.fields.map((f) => `${jsKey(f.name)}: ${f.zod} /* TODO: tighten */`).join(", ")} }) },`);
  }
  lines.push(`  responses: [{ status: 200, schema: z.object({}) /* TODO: response shape */ }],`, `},`);
  return lines.join("\n");
}

/** The handler-emit adapter seam — a target renders the HANDLER half in its app's idiom. */
export interface HandlerTarget {
  name: string;
  emitHandler(spec: StubSpec): string;
}

/** The toolfactory idiom: an Effect program + the run() boundary + a contract-derived RouteError. The first adapter. */
export const honoEffectTarget: HandlerTarget = {
  name: "hono-effect",
  emitHandler(spec) {
    return [
      `// STUB handler for ${spec.name} — implement the Effect program; it is wired to the route below.`,
      `const ${spec.name}Program = (c: Context<AppCtx>): Effect.Effect<Response, RouteError<${JSON.stringify(spec.name)}>, AppServices> =>`,
      `  Effect.gen(function* () {`,
      `    // TODO: implement ${spec.name} (read input, do the work, return the declared 200 shape)`,
      `    return c.json({});`,
      `  });`,
      ``,
      `app.${spec.method}(${JSON.stringify(spec.path)}, (c) => run(${spec.name}Program(c), c.env));`,
    ].join("\n");
  },
};

/** A framework-generic Hono fallback target. */
export const honoTarget: HandlerTarget = {
  name: "hono",
  emitHandler(spec) {
    return [
      `// STUB handler for ${spec.name}.`,
      `app.${spec.method}(${JSON.stringify(spec.path)}, async (c) => {`,
      `  // TODO: implement ${spec.name}`,
      `  return c.json({});`,
      `});`,
    ].join("\n");
  },
};

export interface GeneratedStub {
  name: string;
  spec: StubSpec;
  contract: string;
  handler: string;
}

/** Generate the contract + handler stub for one gap, lowered through a handler target. */
export function generateStub(gap: StubGap, target: HandlerTarget = honoEffectTarget): GeneratedStub {
  const spec = stubSpec(gap);
  return { name: spec.name, spec, contract: renderContract(spec), handler: target.emitHandler(spec) };
}

/** Generate stubs for many gaps. */
export function generateStubs(gaps: StubGap[], target: HandlerTarget = honoEffectTarget): GeneratedStub[] {
  return gaps.map((g) => generateStub(g, target));
}
