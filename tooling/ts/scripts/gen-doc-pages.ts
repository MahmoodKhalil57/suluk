// Regenerate the one DERIVED narrative page — docs-pages/architecture.md — so its package-dependency
// diagram can never drift from the actual @suluk/* dependency graph. The other narrative pages
// (index / getting-started / contributing / community) are hand-authored and static; only the architecture
// page carries a generated artifact (the D2 graph), so only it is regenerated here.
//
// Reuses @suluk/docs (harvest + packageGraphD2 + krokiD2Url) — the same projection idea the site is built on.
// Run standalone with `bun tooling/ts/scripts/gen-doc-pages.ts`, or via the deploy pipeline (deploy-docs.ts).
import { harvest, packageGraphD2, krokiD2Url } from "../packages/docs/src/index";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

const tsRoot = new URL("..", import.meta.url).pathname; // tooling/ts
const repoRoot = join(tsRoot, "..", "..");
const pagesDir = join(tsRoot, "docs-pages");
const RAW = "https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/tooling/ts/docs-pages/architecture.d2";

const fw = harvest({
  packagesDir: join(tsRoot, "packages"),
  title: "Suluk",
  tagline: "",
  description: "",
  repoUrl: "https://github.com/MahmoodKhalil57/suluk",
  architecturePath: join(tsRoot, "..", "ARCHITECTURE.md"), // tooling/ARCHITECTURE.md
  repoRoot,
});

// The fresh D2 of the @suluk package graph (committed as source too, so it's inspectable/renderable).
const d2 = packageGraphD2(fw.packages);
const kroki = krokiD2Url(d2);

// The design prose (ARCHITECTURE.md, verbatim) + the derived diagram section. Strip ARCHITECTURE.md's
// leading H1 so the frontmatter title is the only page heading (TypeDoc renders `title:` as the page H1).
const prose = (fw.architecture ?? "# Architecture\n\nSuluk derives a whole stack from one v4 contract.")
  .replace(/^\s*#\s+.*\r?\n/, "");

const diagram = `
## How the tools compose

Each package derives one facet from the single v4 contract; here is how they depend on each other — every
package pointing at its \`@suluk/*\` dependencies.

![Suluk package dependency graph](${kroki})

[D2 source](${RAW}) — render with the [d2 CLI](https://d2lang.com) or paste it into [d2lang.com/playground](https://play.d2lang.com).
`;

const page = `---
title: Architecture
---

# Architecture

${prose.trim()}

${diagram.trim()}
`;

mkdirSync(pagesDir, { recursive: true });
writeFileSync(join(pagesDir, "architecture.md"), page);
writeFileSync(join(pagesDir, "architecture.d2"), d2 + "\n");
console.log(`Regenerated architecture.md (+ architecture.d2) — ${fw.packages.length} packages graphed.`);
