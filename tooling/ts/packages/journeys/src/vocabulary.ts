/**
 * The VOCABULARY projection (C038): a v4 document → a deterministic Gherkin step palette.
 *
 * Pure function of the document — same contract in, same vocabulary out, no network. Every step phrase is derived
 * from a name the contract already holds, so the vocabulary carries ZERO information the contract lacks:
 *   - GIVEN  ← `x-suluk-access.requires` (the WHO axis): authenticated → "Given I am a signed-in user".
 *   - WHEN   ← the operation (method + name): "When I checkout", "When I view credits".
 *   - THEN   ← declared statuses ("Then it succeeds"), `x-suluk-store` (query key → "Then I see my <key>";
 *             mutation invalidates → "Then my <key> refreshes"), and per-unit `x-suluk-cost` ("Then I am charged credits").
 *
 * Step IDENTITY is `op.name @ path-uri` (the stable C009 by-name handle), NEVER the @suluk/sdk client accessor
 * (which `resolveOps` mutates in place). GIVEN steps key on a synthetic `@access:<role>` handle.
 */
import type { OpenAPIv4Document, Request } from "@suluk/core";
import { camel, norm } from "./normalize";

export type StepKind = "given" | "when" | "then";

export interface JourneyStep {
  /** Given / When / Then. */
  kind: StepKind;
  /** the human-readable phrase an author writes, e.g. "When I checkout". */
  phrase: string;
  /** the normalized matching skeleton (slot values stripped). */
  skeleton: string;
  /** stable identity: `op.name@path-uri`, or `@access:<role>` for a Given. */
  handle: string;
  /** provenance of this phrase (which contract fact produced it). */
  via: string;
}

export interface VocabOperation {
  handle: string;
  name: string;
  path: string;
  method: string;
  access: string;
}

export interface Vocabulary {
  /** every generated step, sorted deterministically. */
  steps: JourneyStep[];
  /** the operation table (for coverage + the phrasebook). */
  operations: VocabOperation[];
}

/** Stable by-name handle. */
export const opHandle = (name: string, path: string): string => `${name}@${path}`;

interface AccessFacet {
  requires?: string;
}
interface CostComponent {
  basis?: string;
}
interface CostFacet {
  components?: CostComponent[];
  estimateMicroUsd?: number;
}

// x-suluk-access / x-suluk-cost are advisory vendor facets NOT modeled on the typed `Request` (a consumer stamps them,
// e.g. toolfactory via Object.assign) — read them through an untyped view rather than the typed surface.
const ext = (op: Request): Record<string, unknown> => op as unknown as Record<string, unknown>;
const accessOf = (op: Request): string => {
  const a = ext(op)["x-suluk-access"] as AccessFacet | undefined;
  return typeof a?.requires === "string" ? a.requires : "anyone";
};
const isMetered = (op: Request): boolean => {
  const c = ext(op)["x-suluk-cost"] as CostFacet | undefined;
  return Array.isArray(c?.components) && c.components.some((x) => x?.basis === "per-unit");
};
const statusesOf = (op: Request): string[] =>
  op.responses ? Object.keys(op.responses) : [];

/** Derive the canonical WHEN phrase for an operation from its method + name. */
function whenPhrase(name: string, method: string): string {
  const words = camel(name).split(" ");
  const verb = method === "get" && (words[0] === "get" || words[0] === "list") ? "view " + words.slice(1).join(" ") : words.join(" ");
  return `When I ${verb}`.replace(/\s+/g, " ").trim();
}

/** Project a v4 document into the deterministic step vocabulary. */
export function generateVocabulary(doc: OpenAPIv4Document): Vocabulary {
  const steps: JourneyStep[] = [];
  const operations: VocabOperation[] = [];
  const push = (kind: StepKind, phrase: string, handle: string, via: string) => steps.push({ kind, phrase, skeleton: norm(phrase), handle, via });

  for (const [path, item] of Object.entries(doc.paths)) {
    for (const [name, op] of Object.entries(item.requests ?? {})) {
      const handle = opHandle(name, path);
      const access = accessOf(op);
      operations.push({ handle, name, path, method: op.method, access });

      if (access === "authenticated") push("given", "Given I am a signed-in user", "@access:authenticated", "x-suluk-access");
      push("when", whenPhrase(name, op.method), handle, `op ${op.method.toUpperCase()} ${path}`);

      const statuses = statusesOf(op);
      if (statuses.includes("200")) push("then", "Then it succeeds", handle, "status 200");
      const store = op["x-suluk-store"];
      if (store?.key) push("then", `Then I see my ${camel(store.key)}`, handle, `x-suluk-store key:${store.key}`);
      for (const inv of store?.invalidates ?? []) push("then", `Then my ${camel(inv)} refreshes`, handle, `x-suluk-store invalidates:${inv}`);
      if (isMetered(op)) push("then", "Then I am charged credits", handle, "x-suluk-cost per-unit");
    }
  }

  // deterministic order: kind, then phrase, then handle.
  const ORDER: Record<StepKind, number> = { given: 0, when: 1, then: 2 };
  steps.sort((a, b) => ORDER[a.kind] - ORDER[b.kind] || a.phrase.localeCompare(b.phrase) || a.handle.localeCompare(b.handle));
  operations.sort((a, b) => a.handle.localeCompare(b.handle));
  return { steps, operations };
}

/** A foldable, entity-grouped phrasebook (Markdown) — the human surface an author picks step phrases from. */
export function renderPhrasebook(vocab: Vocabulary): string {
  const byHandle = new Map<string, JourneyStep[]>();
  for (const s of vocab.steps) {
    if (s.handle.startsWith("@access:")) continue;
    (byHandle.get(s.handle) ?? byHandle.set(s.handle, []).get(s.handle)!).push(s);
  }
  const lines: string[] = ["# Available steps (generated from the contract)\n", "_Given I am a signed-in user_ — available on every authenticated operation.\n"];
  for (const op of vocab.operations) {
    const steps = byHandle.get(op.handle);
    if (!steps?.length) continue;
    lines.push(`\n### ${op.name}  \`${op.method.toUpperCase()} ${op.path}\``);
    for (const s of steps) lines.push(`- ${s.phrase}`);
  }
  return lines.join("\n");
}

/** A deterministic content hash of the vocabulary (djb2 hex) — for drift detection / the build artifact. */
export function vocabularyHash(vocab: Vocabulary): string {
  const payload = JSON.stringify(vocab.steps.map((s) => [s.kind, s.skeleton, s.handle]));
  let h = 5381;
  for (let i = 0; i < payload.length; i++) h = (((h << 5) + h) ^ payload.charCodeAt(i)) >>> 0;
  return h.toString(16).padStart(8, "0");
}
