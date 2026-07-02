// Regenerate the DERIVED narrative pages for the umbrella site, so they can never drift from the packages:
//   docs-pages/architecture.md        — the design prose (ARCHITECTURE.md) + the UML architecture diagram
//   docs-pages/architecture-uml.svg   — that diagram: a static UML "Strata-of-Derivation" SVG rendered with d3
//   docs-pages/packages.md            — the Packages index: every documented package → its own root docs site
//
// Also exports documentedPackages() — the single source of truth for WHICH packages get a root site — reused
// by build-docs.ts. Reuses @suluk/docs (harvest + architectureGraphData). Runnable standalone
// (`bun tooling/ts/scripts/gen-doc-pages.ts`) or via build-docs.ts / deploy-docs.ts.
import { harvest, harvestPackage, architectureGraphData, parseExports, type ArchitectureGraph } from "../packages/docs/src/index";
import { renderArchitectureSvg, REGISTRY_CONFIG } from "./archgraph";
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const tsRoot = new URL("..", import.meta.url).pathname; // tooling/ts
const repoRoot = join(tsRoot, "..", "..");
const pagesDir = join(tsRoot, "docs-pages");
const packagesRoot = join(tsRoot, "packages");

/** Packages that get NO root docs site: the private demo app, the prebuilt bundle, the editor extension app. */
export const EXCLUDED = new Set(["example-petshop", "scalar-standalone", "vscode"]);

export interface DocPackage {
  name: string;   // @suluk/<x>
  slug: string;   // <x> (url + output-dir segment, from the npm name)
  dir: string;    // absolute package dir
  description: string;
  version: string;
  hasReadme: boolean;
}

/** The single source of truth for which packages get a root docs site (a library package with src/index.ts). */
export function documentedPackages(): DocPackage[] {
  return readdirSync(packagesRoot)
    .filter((d) => !EXCLUDED.has(d))
    .map((d) => join(packagesRoot, d))
    .filter((dir) => existsSync(join(dir, "src", "index.ts")))
    .map((dir) => ({ dir, p: harvestPackage(dir, repoRoot) }))
    .filter((x): x is { dir: string; p: NonNullable<typeof x.p> } => !!x.p && !x.p.private)
    // slug = the npm name minus the "@suluk/" prefix (harvest's slug prepends "suluk-"); strip it so a
    // root lives at docs/packages/<name>/ (e.g. admin, keys, openapi-compat) — matching the package name.
    .map(({ dir, p }) => ({ name: p.name, slug: p.slug.replace(/^suluk-/, ""), dir, description: p.description, version: p.version, hasReadme: p.readme.trim().length > 0 }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** A shadcn-registry item, harvested from registry.json + its own `.ts` files — the registry analogue of DocPackage. */
export interface RegistryItem {
  name: string; // the item slug (url + output-dir segment)
  title: string;
  description: string;
  category: string; // the stratum folder: foundation | services | derivation | surfaces (from registry/<category>/<name>/)
  dir: string; // absolute registry/<category>/<name>
  files: string[]; // absolute `.ts` entry files (from registry.json files[]) — the TypeDoc entry points
  regDeps: string[]; // other registry items it builds on (registryDependencies, the intra-registry edges)
  npmDeps: string[]; // third-party npm deps
  sulukDeps: string[]; // the @suluk/* packages it wires over
  hasReadme: boolean;
  exports: number; // count of public symbols across its files (the surface-area badge)
  topExports: string[]; // a deterministic sample (for the arch-graph members compartment)
}

/** The single source of truth for the registry: registry.json items, enriched with parsed exports + their files. */
export function documentedRegistry(): RegistryItem[] {
  const reg = JSON.parse(readFileSync(join(repoRoot, "registry.json"), "utf8")) as {
    items?: { name: string; title?: string; description?: string; dependencies?: string[]; registryDependencies?: string[]; files?: { path: string }[] }[];
  };
  const strip = (d: string) => d.replace(/^MahmoodKhalil57\/suluk\//, "");
  return (reg.items ?? [])
    .map((it) => {
      // the item's source dir + stratum are DERIVED from its registry.json paths (registry/<category>/<name>/<file>),
      // so the harvest follows the category-folder restructure without a second source of truth.
      const segs = (it.files?.[0]?.path ?? `registry/${it.name}/_`).split("/");
      const category = segs.length >= 4 ? segs[1] : "";
      const dir = join(repoRoot, ...segs.slice(0, -1));
      const files = (it.files ?? [])
        .map((f) => join(repoRoot, f.path))
        .filter((p) => p.endsWith(".ts") && existsSync(p));
      const names = new Set<string>();
      for (const f of files) for (const n of parseExports(readFileSync(f, "utf8"))) names.add(n);
      const sorted = [...names].sort((a, b) => a.localeCompare(b));
      const deps = it.dependencies ?? [];
      return {
        name: it.name,
        title: it.title || it.name,
        description: it.description || "",
        category,
        dir,
        files,
        regDeps: (it.registryDependencies ?? []).map(strip),
        npmDeps: deps.filter((d) => !d.startsWith("@suluk/")),
        sulukDeps: deps.filter((d) => d.startsWith("@suluk/")),
        hasReadme: existsSync(join(dir, "README.md")),
        exports: sorted.length,
        topExports: sorted.slice(0, 6),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** The registry as an ArchitectureGraph: each item a node, `registryDependencies` the intra-registry edges. */
export function registryGraphData(items = documentedRegistry()): ArchitectureGraph {
  const present = new Set(items.map((i) => i.name));
  const nodes = items.map((i) => ({ id: i.name, name: i.name, exports: i.exports, topExports: i.topExports, category: i.category }));
  const links: { source: string; target: string }[] = [];
  for (const i of items) for (const d of i.regDeps) if (present.has(d) && d !== i.name) links.push({ source: i.name, target: d });
  return { nodes, links };
}

/** Map each registry item → the `@suluk/platform` service (`<camel>Service`) that composes it, matched against
 *  platform's ACTUAL exports (so an unmatched module falls back gracefully). The `definePlatform` ⇒ registry map. */
export function platformServiceMap(): Map<string, string> {
  const dir = join(packagesRoot, "platform", "src");
  const names = new Set<string>();
  if (existsSync(dir)) for (const f of readdirSync(dir).filter((f) => f.endsWith(".ts"))) {
    for (const n of parseExports(readFileSync(join(dir, f), "utf8"))) names.add(n);
  }
  const camel = (s: string) => s.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
  const map = new Map<string, string>();
  for (const it of documentedRegistry()) {
    const svc = `${camel(it.name)}Service`;
    if (names.has(svc)) map.set(it.name, svc);
  }
  return map;
}

/** A DiagramConfig that reframes the registry graph as `@suluk/platform`'s projection: each box's «stereotype» is
 *  the `definePlatform` service that composes that module. Reuses the registry layout/edges; only the labels change. */
export function platformRegistryConfig() {
  const svc = platformServiceMap();
  const n = svc.size;
  return {
    ...REGISTRY_CONFIG,
    title: "@suluk/platform — the registry it assembles",
    subtitle: () => `definePlatform composes ${n} services, each realized by an own-the-code registry module below. The «…Service» on each box is platform's; the box is the module it wires.`,
    caption: "Box = registry module · «stereotype» = the @suluk/platform service (definePlatform) that composes it · dashed → = registry dependency (points to the base module).",
    roleOf: (name: string) => svc.get(name) ?? REGISTRY_CONFIG.roleOf(name),
    boxLegend: "registry module (its «…Service» is platform's)",
    keystoneBusLabel: (d: number) => `↓ app foundation · ${d} modules build on app`,
  };
}

/** Regenerate architecture.md + packages.md; returns the documented-package list (for build-docs). */
export function generatePages(): DocPackage[] {
  mkdirSync(pagesDir, { recursive: true });

  // ── architecture.md: ARCHITECTURE.md prose + a d3 package-dependency graph (static SVG, replaces D2/kroki) ──
  const fw = harvest({
    packagesDir: packagesRoot,
    title: "Suluk", tagline: "", description: "",
    repoUrl: "https://github.com/MahmoodKhalil57/suluk",
    architecturePath: join(tsRoot, "..", "ARCHITECTURE.md"),
    repoRoot,
  });
  // Render the UML architecture diagram to a static SVG with d3 and commit it; reference it via jsdelivr (which
  // serves the committed file as image/svg+xml — raw.githubusercontent serves .svg as text/plain, so an <img>
  // there won't render). The same <img> works in the HTML site AND the GitHub markdown mirror. A fresh filename
  // (not the retired `architecture-pkggraph.svg`) also side-steps jsdelivr's @main cache on the old URL.
  writeFileSync(join(pagesDir, "architecture-uml.svg"), renderArchitectureSvg(architectureGraphData(fw.packages)));
  const GRAPH = "https://cdn.jsdelivr.net/gh/MahmoodKhalil57/suluk@main/tooling/ts/docs-pages/architecture-uml.svg";
  // The REGISTRY architecture diagram — the same renderer, the registry surface: every shadcn item tied to the
  // ones it builds on (registryDependencies), with `app` as the foundation keystone.
  writeFileSync(join(pagesDir, "registry-uml.svg"), renderArchitectureSvg(registryGraphData(), REGISTRY_CONFIG));
  // The PLATFORM projection of the registry — the SAME registry graph, but each module is stereotyped with the
  // `@suluk/platform` service (`definePlatform`) that composes it (authService ⇒ auth, …). The service names are
  // matched against platform's actual exports, so this is a real autogenerated projection, not an assertion.
  writeFileSync(join(pagesDir, "platform-registry-uml.svg"), renderArchitectureSvg(registryGraphData(), platformRegistryConfig()));
  const prose = (fw.architecture ?? "# Architecture\n\nSuluk derives a whole stack from one v4 contract.")
    .replace(/^\s*#\s+.*\r?\n/, ""); // strip leading H1 (frontmatter title is the page heading)
  const architectureMd = `---
title: Architecture
---

# Architecture

${prose.trim()}

## The package architecture

The ${fw.packages.filter((p) => !p.private).length} \`@suluk/*\` packages form a **derivation stack**: everything is projected from the single v4
contract in \`@suluk/core\` (the keystone — 25 packages depend on it), up through six named strata from raw
primitives to shipped apps. This is a **UML view** of that stack — every package is a class-box carrying its
\`«role»\`, its public-export count, and a sample of its exports, and every dashed arrow is a \`«use»\` dependency
pointing at the package it depends on. Read it top (apps) down to the foundation.

![Suluk architecture — a UML strata diagram of the @suluk packages](${GRAPH})
`;
  writeFileSync(join(pagesDir, "architecture.md"), architectureMd);

  // ── packages.md: the index of per-package root sites. Links are ABSOLUTE (the umbrella and each root are
  // SEPARATE renders, so the umbrella can't resolve packages/<name>/ as a local file — TypeDoc would warn and
  // try to copy it; absolute http(s) URLs it leaves alone). ──
  const HOSTED = "https://mahmoodkhalil57.github.io/suluk/";
  const pkgs = documentedPackages();
  const rows = pkgs
    .map((p) => `- <a href="${HOSTED}packages/${p.slug}/"><code>${p.name}</code></a> — ${p.description || "&mdash;"}`)
    .join("\n");
  const packagesMd = `---
title: Packages
---

# Packages

Every \`@suluk/*\` package is its **own complete documentation site** — its README as the home page, any
per-package guides, and the full symbol-by-symbol API reference. ${pkgs.length} packages:

${rows}
`;
  writeFileSync(join(pagesDir, "packages.md"), packagesMd);

  console.log(`Regenerated architecture.md (+ d3 SVG) and packages.md — ${pkgs.length} documented packages.`);
  return pkgs;
}

if (import.meta.main) generatePages();
