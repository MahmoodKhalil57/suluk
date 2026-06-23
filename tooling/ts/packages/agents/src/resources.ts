/**
 * LOADABLE RESOURCES (C036) — Suluk's contract-first form of Cloudflare's "Agent Skills": a top-level
 * `x-suluk-resources` CATALOG of on-demand instructions / references / scripts an agent ACTIVATES when a task
 * matches, so a large library does not bloat every prompt. Distinct from a `skill` (model-bearing, always-on system
 * text): a resource is content-only, lazy, no model.
 *
 * This module is the static surface: `resourceCatalog` (the CF `get()` metadata listing an agent's catalog projects
 * to) + `lintResources` (well-formedness + dangling-ref + the experimental-script flag). Pure + static; never read by
 * the D1 matcher. Content is a provenance POINTER (the catalog/SKILL.md is generated + drift-hashed), never inlined.
 */
import type { OpenAPIv4Document, SulukResource } from "@suluk/core";
import { agentMap, parsePointer } from "./resolve";

/** The top-level resources catalog (empty when absent). */
export const resourceMap = (doc: OpenAPIv4Document): Record<string, SulukResource> => doc["x-suluk-resources"] ?? {};

/** Decode a resource ref `#/x-suluk-resources/<key>` to its key (or null if malformed / not a resource ref). */
export function resourceKey(ref: string): string | null {
  const toks = parsePointer(ref);
  return toks && toks.length === 2 && toks[0] === "x-suluk-resources" ? toks[1] : null;
}

/** One entry in an agent's loadable catalog — the CF Agent-Skill `get()` listing (what appears in the system prompt). */
export interface CatalogEntry {
  /** the resource key in `x-suluk-resources`. */
  key: string;
  /** the agent's local ref name (the `resources` map key). */
  local: string;
  description: string;
  kind: SulukResource["kind"];
  trust: "author-declared" | "retrieved";
  provenance: { source: string; contentHash: string; version?: string };
}

/**
 * The agent's reachable loadable-resource catalog — its DIRECT `resources` refs resolved against the top-level map
 * (each sub-agent owns its own catalog, so this is not transitive), sorted by key. Dangling refs are skipped here
 * (`lintResources` owns that error). This is the listing a projection renders into the system prompt / `SKILL.md` set.
 */
export function resourceCatalog(doc: OpenAPIv4Document, agentName: string): CatalogEntry[] {
  const agent = agentMap(doc)[agentName];
  if (!agent?.resources) return [];
  const cat = resourceMap(doc);
  const out: CatalogEntry[] = [];
  for (const [local, r] of Object.entries(agent.resources)) {
    const key = resourceKey(r.ref);
    const res = key ? cat[key] : undefined;
    if (!key || !res) continue; // dangling/malformed — lintResources owns the error
    // shallow-copy provenance so a caller mutating a catalog entry can't write through to the source document.
    out.push({ key, local, description: res.description, kind: res.kind, trust: res.trust ?? "author-declared", provenance: { ...res.provenance } });
  }
  return out.sort((a, b) => a.key.localeCompare(b.key));
}

export interface ResourceFinding {
  severity: "error" | "warning" | "info";
  code: string;
  detail: string;
}

const KINDS = new Set(["instructions", "reference", "script"]);

/**
 * Lint the resources catalog + every agent's refs into it: catalog entries must be well-formed (description, valid
 * kind, pinned provenance), agent refs must resolve, retrieved content is flagged (advisory), and `kind: "script"` is
 * flagged a warning (CF Agent-Skill script execution is EARLY/experimental — C036's honest caveat). Pure; no throw.
 */
export function lintResources(doc: OpenAPIv4Document): ResourceFinding[] {
  const cat = resourceMap(doc);
  const out: ResourceFinding[] = [];

  for (const [key, r] of Object.entries(cat)) {
    // a lint must REPORT malformed input, never crash on it — a non-string description is a no-description error, not a throw.
    if (typeof r.description !== "string" || !r.description.trim())
      out.push({ severity: "error", code: "resource-no-description", detail: `resource "${key}": a non-empty string description is required (the catalog listing the model selects on)` });
    if (!KINDS.has(r.kind))
      out.push({ severity: "error", code: "resource-bad-kind", detail: `resource "${key}": kind must be instructions | reference | script` });
    if (!r.provenance?.source || !r.provenance?.contentHash)
      out.push({ severity: "error", code: "resource-unpinned", detail: `resource "${key}": provenance.source + contentHash are required (the catalog/SKILL.md is generated + drift-hashed)` });
    if (r.trust === "retrieved")
      out.push({ severity: "info", code: "resource-retrieved", detail: `resource "${key}": retrieved (untrusted) content — may not escalate scope/provenance` });
    if (r.kind === "script")
      out.push({ severity: "warning", code: "resource-script-experimental", detail: `resource "${key}": kind "script" maps to CF Agent-Skill script execution, which is EARLY/experimental` });
  }

  for (const [name, agent] of Object.entries(agentMap(doc))) {
    for (const [local, ref] of Object.entries(agent.resources ?? {})) {
      const key = resourceKey(ref.ref);
      if (!key) out.push({ severity: "error", code: "resource-malformed-ref", detail: `agent "${name}".resources.${local}: "${ref.ref}" is not a #/x-suluk-resources/<key> ref` });
      else if (!cat[key]) out.push({ severity: "error", code: "resource-dangling-ref", detail: `agent "${name}".resources.${local}: "${ref.ref}" → no such resource "${key}"` });
    }
  }
  return out;
}

/** True ⇒ no error-severity resource finding (the install-gate predicate for the resources facet). */
export function resourcesOk(doc: OpenAPIv4Document): boolean {
  return !lintResources(doc).some((f) => f.severity === "error");
}
