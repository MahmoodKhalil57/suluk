/**
 * The "how the tools compose" diagram for the docs site — D2 of the @suluk package graph (each package → its
 * @suluk dependencies). It's the same projection idea as the contract diagrams, applied one level up: instead of
 * one contract → its layers, it's the whole toolkit → how the packages depend on each other. Generated from the
 * harvested package.json deps, rendered on the Architecture page (via kroki.io) + committed as architecture.d2.
 */
import { deflateSync } from "node:zlib";
import type { PackageDoc } from "./harvest";

const short = (name: string) => name.replace(/^@suluk\//, "");
function d2id(name: string): string {
  const s = short(name);
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(s) ? s : `"${s.replace(/"/g, '\\"')}"`;
}

export interface PackageGraph {
  nodes: { id: string; label: string }[];
  links: { source: string; target: string }[];
}

/**
 * The `@suluk` package dependency graph as pure data (each package → its drawn `@suluk` dependencies) — the input
 * to the d3 renderer (build tooling), replacing the old D2/kroki path. Zero-dep, so it stays in `@suluk/docs`.
 */
export function packageGraphData(packages: PackageDoc[]): PackageGraph {
  const visible = packages.filter((p) => !p.private);
  const present = new Set(visible.map((p) => p.name));
  const nodes = visible.map((p) => ({ id: p.name, label: short(p.name) }));
  const links: { source: string; target: string }[] = [];
  for (const p of visible) {
    for (const dep of [...p.dependencies, ...p.peerDependencies]) {
      if (present.has(dep) && dep !== p.name) links.push({ source: p.name, target: dep });
    }
  }
  return { nodes, links };
}

/** A package node enriched for the UML architecture diagram (name, public-export count, a sample of exports). */
export interface ArchNode {
  id: string;
  name: string;
  /** Number of public symbols the barrel re-exports (the node's surface-area badge). */
  exports: number;
  /** A small deterministic sample of exported symbol names (for the node's members compartment). */
  topExports: string[];
}
export interface ArchitectureGraph {
  nodes: ArchNode[];
  links: { source: string; target: string }[];
}

/**
 * The `@suluk` graph enriched for the UML "Strata-of-Derivation" architecture diagram: each package carries its
 * export count + a sample of export names so the renderer can draw a UML class-box (name + members compartment)
 * per package, and the same `@suluk`-only dependency edges as {@link packageGraphData}. Pure data, zero-dep —
 * the layout/stereotypes/colours live in the build-tooling renderer (`scripts/pkggraph.ts`).
 */
export function architectureGraphData(packages: PackageDoc[]): ArchitectureGraph {
  const visible = packages.filter((p) => !p.private);
  const present = new Set(visible.map((p) => p.name));
  const nodes: ArchNode[] = visible.map((p) => ({
    id: p.name,
    name: short(p.name),
    exports: p.exports.length,
    topExports: p.exports.slice(0, 6), // the barrel's exports are already sorted; take a stable sample
  }));
  const links: { source: string; target: string }[] = [];
  for (const p of visible) {
    for (const dep of [...p.dependencies, ...p.peerDependencies]) {
      if (present.has(dep) && dep !== p.name) links.push({ source: p.name, target: dep });
    }
  }
  return { nodes, links };
}

/**
 * @deprecated D2 is being retired across the repo in favour of d3 (see `packageGraphData` + the d3 SVG renderer
 * in `scripts/pkggraph.ts`). Kept for backward compatibility; no longer used by the docs build.
 */
export function packageGraphD2(packages: PackageDoc[]): string {
  const visible = packages.filter((p) => !p.private);
  // only DRAWN packages are valid edge endpoints — a dep on a private package is omitted (no dangling phantom node)
  const present = new Set(visible.map((p) => p.name));
  const lines: string[] = ["# Suluk — how the tools compose (each package → its @suluk dependencies)", "direction: right", ""];
  for (const p of visible) lines.push(`${d2id(p.name)}: {label: "${short(p.name)}"; shape: rectangle}`);
  lines.push("");
  for (const p of visible) {
    for (const dep of [...p.dependencies, ...p.peerDependencies]) {
      if (present.has(dep) && dep !== p.name) lines.push(`${d2id(p.name)} -> ${d2id(dep)}`);
    }
  }
  return lines.join("\n");
}

/**
 * @deprecated Part of the retired D2/kroki path; use `packageGraphData` + the d3 SVG renderer instead.
 * A kroki.io render URL for D2 source (deflate + base64url).
 */
export function krokiD2Url(d2: string): string {
  return `https://kroki.io/d2/svg/${deflateSync(new TextEncoder().encode(d2)).toString("base64url")}`;
}
