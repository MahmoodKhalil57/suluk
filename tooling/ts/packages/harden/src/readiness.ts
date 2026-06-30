/**
 * READINESS audit (C043) — a SECOND, separate harden dimension (kept apart from the security `auditDocument` grade so a
 * security score never mixes with a readiness score). It grades schema-FACT readiness the doc can answer alone — the
 * concerns C040/C041 made expressible:
 *   • `computed-required` — a request field marked `computed` (or `readOnly`) AND `required`: a client CANNOT send it,
 *     so the request can never be satisfied (a real contract bug). HIGH.
 *   • `request-without-example` — a request body with no curated `examples`/`example` (author one in `.meta`, or promote
 *     a tester `@public` row). A docs/demo readiness gap. LOW.
 *
 * BDD COVERAGE is the OTHER readiness gap — but it needs the `.feature` files, so `@suluk/journeys` computes it and the
 * caller folds its letter in via `combineGrades` (harden never depends on journeys — the established harden+agents seam).
 */
import type { OpenAPIv4Document } from "@suluk/core";
import { fieldOrigin, type JsonSchema } from "@suluk/examples";
import { grade, type Finding, type Grade } from "./audit";

export interface ReadinessAudit {
  findings: Finding[];
  nodes: number;
  clean: number;
  score: number;
  grade: Grade;
}

export interface ReadinessOptions {
  /** skip operations (e.g. third-party/ingested surfaces) — they don't count toward the readiness grade. */
  ignore?: (uri: string, name: string) => boolean;
}

interface RawReq {
  method: string;
  contentSchema?: unknown;
  parameterSchema?: { body?: unknown };
}

const hasExample = (s: JsonSchema): boolean => (Array.isArray(s.examples) && s.examples.length > 0) || "example" in s;

/** Audit the document's request bodies for client-sendability + example presence → findings + a readiness grade. */
export function auditReadiness(doc: OpenAPIv4Document, opts: ReadinessOptions = {}): ReadinessAudit {
  const findings: Finding[] = [];
  let nodes = 0;
  let clean = 0;
  const pass = () => {
    nodes++;
    clean++;
  };
  const fail = (f: Finding) => {
    nodes++;
    findings.push(f);
  };

  for (const [uri, piRaw] of Object.entries(doc.paths ?? {})) {
    const pi = piRaw as { requests?: Record<string, RawReq> };
    for (const [name, req] of Object.entries(pi.requests ?? {})) {
      if (opts.ignore?.(uri, name)) continue;
      const body = (req.contentSchema ?? req.parameterSchema?.body) as JsonSchema | undefined;
      if (!body || typeof body !== "object") continue; // no request body → nothing to assess

      // node: a curated example present?
      if (hasExample(body)) pass();
      else fail({ rule: "request-without-example", severity: "low", path: `${name}/body`, message: `request '${name}' has no example`, fix: "author one in .meta({ examples }), or promote a tester @public row via `journeys promote`" });

      // node per REQUIRED field: is it client-sendable (not computed/readOnly)?
      const props = (body.properties ?? {}) as Record<string, JsonSchema>;
      const required = new Set(Array.isArray(body.required) ? (body.required as string[]) : []);
      for (const [k, sub] of Object.entries(props)) {
        if (!required.has(k)) continue;
        if (fieldOrigin(sub) === "computed") {
          fail({ rule: "computed-required", severity: "high", path: `${name}/body/${k}`, message: `required field '${k}' is computed/readOnly — a client cannot send it`, fix: "make it optional or non-computed (drop x-suluk-origin:computed / readOnly), or remove it from required" });
        } else {
          pass();
        }
      }
    }
  }

  const score = nodes === 0 ? 100 : Math.round((clean / nodes) * 100);
  return { findings, nodes, clean, score, grade: grade(score) };
}
