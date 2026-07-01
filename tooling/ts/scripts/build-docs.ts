// Build the MULTI-ROOT Suluk documentation site (C054):
//   docs/                   — the general "umbrella": a documents-only TypeDoc render (narrative home +
//                             getting-started / architecture / packages-index / contributing / community).
//   docs/packages/<name>/   — each @suluk/* package as its OWN complete TypeDoc ROOT site: its README as the
//                             home page, any per-package guides (packages/<name>/docs-pages/*.md), the full
//                             symbol-by-symbol API, the same github theme + vscode-icons, and a back-link up.
//
// Driven via the TypeDoc Node API (one render per root) rather than a single typedoc.json — each root needs its
// own name/entryPoints/readme/out/navigationLinks. Run `bun scripts/build-docs.ts` (from tooling/ts) or via
// deploy-docs.ts. cwd is pinned to tooling/ts so the bare `typedoc-github-theme` plugin resolves.
import { Application } from "typedoc";
import { join, dirname } from "node:path";
import { existsSync, readdirSync } from "node:fs";
import { generatePages, type DocPackage } from "./gen-doc-pages";

const TS = join(dirname(new URL(import.meta.url).pathname), ".."); // tooling/ts
const REPO = join(TS, "..", "..");
// DOCS_OUT overrides the output root (for dev builds into a scratch dir); defaults to the repo docs/.
const DOCS = process.env.DOCS_OUT || join(REPO, "docs");
const UMBRELLA_URL = "https://mahmoodkhalil57.github.io/suluk/";
const REPO_URL = "https://github.com/MahmoodKhalil57/suluk";

const PLUGINS = [
  "typedoc-github-theme",
  join(TS, "scripts", "typedoc-vscode-icons.mjs"),
  join(TS, "scripts", "typedoc-branding-head.mjs"),
];

// Shared render options. No entryPointStrategy:"packages" here — each root is a single-entry "resolve" render.
const BASE = {
  entryPointStrategy: "resolve" as const,
  excludeInternal: true,
  excludePrivate: true,
  skipErrorChecking: true, // lets raw-TS + hoisted peer/workspace deps convert without a build
  includeVersion: true,
  githubPages: true, // writes .nojekyll into each out dir
  searchInComments: true,
  categorizeByGroup: true,
  navigation: { includeCategories: true, includeGroups: true, includeFolders: true, compactFolders: false },
  plugin: PLUGINS,
};

async function render(label: string, options: Record<string, unknown>): Promise<void> {
  const app = await Application.bootstrapWithPlugins(options);
  const project = await app.convert();
  if (!project) throw new Error(`docs: ${label} — convert produced no project`);
  await app.generateOutputs(project);
  if (app.logger.hasErrors()) throw new Error(`docs: ${label} — render reported errors`);
}

export async function buildDocs(): Promise<DocPackage[]> {
  process.chdir(TS); // so the bare "typedoc-github-theme" plugin + package resolution work regardless of caller cwd

  // 0. Regenerate the derived narrative (architecture D2 + the Packages index) and get the package list.
  //    DOCS_ONLY=<slug,slug> limits the per-package roots (dev speed); the umbrella always builds.
  const only = process.env.DOCS_ONLY?.split(",").map((s) => s.trim()).filter(Boolean);
  const allPkgs = generatePages();
  const pkgs = only ? allPkgs.filter((p) => only.includes(p.slug)) : allPkgs;

  // 1. UMBRELLA first — its cleanOutputDir wipes docs/ (incl. a stale docs/packages/ from a prior build).
  console.log("• umbrella → docs/ …");
  await render("umbrella", {
    ...BASE,
    name: "Suluk",
    entryPoints: [], // documents-only
    readme: join(TS, "docs-pages", "index.md"),
    projectDocuments: ["getting-started", "architecture", "packages", "contributing", "community"].map((n) =>
      join(TS, "docs-pages", `${n}.md`),
    ),
    out: DOCS,
    hostedBaseUrl: UMBRELLA_URL,
    sort: ["alphabetical"],
    navigationLinks: { GitHub: REPO_URL },
  });

  // 2. PER-PACKAGE roots into docs/packages/<slug>/ (written after the umbrella clean, so they survive).
  for (const p of pkgs) {
    const perDocs = join(p.dir, "docs-pages");
    const projectDocuments = existsSync(perDocs)
      ? readdirSync(perDocs)
          .filter((f) => f.endsWith(".md"))
          .sort()
          .map((f) => join(perDocs, f))
      : [];
    await render(p.name, {
      ...BASE,
      name: p.name,
      entryPoints: [join(p.dir, "src", "index.ts")],
      readme: p.hasReadme ? join(p.dir, "README.md") : "none",
      projectDocuments,
      out: join(DOCS, "packages", p.slug),
      hostedBaseUrl: `${UMBRELLA_URL}packages/${p.slug}/`,
      sort: ["source-order"],
      // Absolute back-link (robust at any page depth) + a link to the package's source on GitHub.
      navigationLinks: {
        "↑ Suluk": UMBRELLA_URL,
        GitHub: `${REPO_URL}/tree/main/tooling/ts/packages/${p.dir.split("/").pop()}`,
      },
    });
    console.log(`  ✓ ${p.name} → docs/packages/${p.slug}/`);
  }

  console.log(`Built umbrella + ${pkgs.length} package roots → docs/`);
  return pkgs;
}

if (import.meta.main) await buildDocs();
