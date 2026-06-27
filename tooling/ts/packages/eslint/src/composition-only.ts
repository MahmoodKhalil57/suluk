/**
 * `composition-only` ESLint rule — the thin wrapper over the pure {@link analyzeComposition} core. Scope it to the tiers
 * that must stay composition-only (pages + sections) via the flat-config `files` glob; it reports each native element,
 * `<script>`/`<style>`, inline handler, and frontmatter-logic occurrence beyond its budget at the exact source location.
 *
 * Intentionally typed against a MINIMAL local context shape so the package carries no hard `eslint` dependency (eslint is
 * a peer) — the object is structurally compatible with a real ESLint rule. Options validate against `meta.schema`.
 */
import { analyzeComposition, type CompositionOptions, type Metric } from "./analyze";

export interface Position {
  line: number;
  column: number;
}
/** The minimal slice of ESLint's rule context this rule uses (exported so the emitted declarations can name it). */
export interface RuleContext {
  options: [CompositionOptions?];
  sourceCode: { getText(): string; getLocFromIndex(index: number): Position };
  report(descriptor: { loc: { start: Position; end: Position }; messageId: string; data?: Record<string, string> }): void;
}

const MESSAGES: Record<Metric, string> = {
  native: "Native <{{tag}}> in a page/section — markup belongs in a block (compose components here, don't author HTML).",
  script: "<script> in a page/section — JS belongs in a block that mounts a controller.",
  style: "<style> in a page/section — styling belongs in components/blocks.",
  handler: "Inline {{attr}} handler in a page/section — behaviour belongs in a block.",
  frontmatter: "Frontmatter logic (`{{token}}`) in a page/section — shape data in a controller, then compose here.",
};

export const compositionOnly = {
  meta: {
    type: "problem",
    docs: { description: "Tier discipline: pages & sections must be composition-only (configurable budgets); markup → blocks, logic → controllers." },
    messages: MESSAGES,
    schema: [
      {
        type: "object",
        properties: {
          budgets: {
            type: "object",
            properties: {
              native: { type: "integer", minimum: 0 },
              script: { type: "integer", minimum: 0 },
              style: { type: "integer", minimum: 0 },
              handler: { type: "integer", minimum: 0 },
              frontmatter: { type: "integer", minimum: 0 },
            },
            additionalProperties: false,
          },
          ignoreTags: { type: "array", items: { type: "string" } },
          allowGetStaticPaths: { type: "boolean" },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context: RuleContext) {
    const sc = context.sourceCode;
    return {
      Program() {
        for (const v of analyzeComposition(sc.getText(), context.options[0] ?? {})) {
          context.report({
            loc: { start: sc.getLocFromIndex(v.index), end: sc.getLocFromIndex(v.index + v.length) },
            messageId: v.metric,
            data: v.data,
          });
        }
      },
    };
  },
};
