// Regenerate the DERIVED narrative pages for the umbrella site, so they can never drift from the packages:
//   docs-pages/architecture.md — the design prose (ARCHITECTURE.md) + a fresh D2 of the @suluk/* graph
//   docs-pages/packages.md     — the Packages index: every documented package → its own root docs site
//
// Also exports documentedPackages() — the single source of truth for WHICH packages get a root site — reused
// by build-docs.ts. Reuses @suluk/docs (harvest + packageGraphD2 + krokiD2Url). Runnable standalone
// (`bun tooling/ts/scripts/gen-doc-pages.ts`) or via build-docs.ts / deploy-docs.ts.
import { harvest, harvestPackage, packageGraphD2, krokiD2Url } from "../packages/docs/src/index";
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const tsRoot = new URL("..", import.meta.url).pathname; // tooling/ts
const repoRoot = join(tsRoot, "..", "..");
const pagesDir = join(tsRoot, "docs-pages");
const packagesRoot = join(tsRoot, "packages");
const RAW = "https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/tooling/ts/docs-pages/architecture.d2";

/** Packages that get NO root docs site: the private demo app, the prebuilt bundle, the editor extension app. */
export const EXCLUDED = new Set(["example-petshop", "scalar-standalone", "vscode"]);

export interface DocPackage {
  name: string;   // @suluk/<x>
  slug: string;   // <x> (url + output-dir segment, from the npm name)
  dir: string;    // absolute package dir
  description: string;
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
    .map(({ dir, p }) => ({ name: p.name, slug: p.slug.replace(/^suluk-/, ""), dir, description: p.description, hasReadme: p.readme.trim().length > 0 }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Regenerate architecture.md + packages.md; returns the documented-package list (for build-docs). */
export function generatePages(): DocPackage[] {
  mkdirSync(pagesDir, { recursive: true });

  // ── architecture.md: ARCHITECTURE.md prose + a fresh D2 dependency graph ──
  const fw = harvest({
    packagesDir: packagesRoot,
    title: "Suluk", tagline: "", description: "",
    repoUrl: "https://github.com/MahmoodKhalil57/suluk",
    architecturePath: join(tsRoot, "..", "ARCHITECTURE.md"),
    repoRoot,
  });
  const d2 = packageGraphD2(fw.packages);
  const prose = (fw.architecture ?? "# Architecture\n\nSuluk derives a whole stack from one v4 contract.")
    .replace(/^\s*#\s+.*\r?\n/, ""); // strip leading H1 (frontmatter title is the page heading)
  const architectureMd = `---
title: Architecture
---

# Architecture

${prose.trim()}

## How the tools compose

Each package derives one facet from the single v4 contract; here is how they depend on each other — every
package pointing at its \`@suluk/*\` dependencies.

![Suluk package dependency graph](${krokiD2Url(d2)})

[D2 source](${RAW}) — render with the [d2 CLI](https://d2lang.com) or paste it into [d2lang.com/playground](https://play.d2lang.com).
`;
  writeFileSync(join(pagesDir, "architecture.md"), architectureMd);
  writeFileSync(join(pagesDir, "architecture.d2"), d2 + "\n");

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

  console.log(`Regenerated architecture.md (+ .d2) and packages.md — ${pkgs.length} documented packages.`);
  return pkgs;
}

if (import.meta.main) generatePages();
