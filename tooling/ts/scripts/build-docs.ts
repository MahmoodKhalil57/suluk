// Build the MULTI-ROOT Suluk documentation site (C054):
//   docs/                   — the general "umbrella": a documents-only TypeDoc render. Narrative home + guides
//                             (getting-started / architecture / contributing / community), the Packages index,
//                             a Registry page, and a nested SPECIFICATION section (Suluk-the-OpenAPI-v4-candidate:
//                             the SPEC + design notes + conformance + confidence + the Rust reference core).
//   docs/packages/<name>/   — each @suluk/* package as its OWN complete TypeDoc ROOT site: its README as the
//                             home page, any per-package guides (packages/<name>/docs-pages/*.md), the full
//                             symbol-by-symbol API, the same github theme + vscode-icons, and a back-link up.
//
// Driven via the TypeDoc Node API (one render per root) rather than a single typedoc.json — each root needs its
// own name/entryPoints/readme/out/navigationLinks. Run `bun scripts/build-docs.ts` (from tooling/ts) or via
// deploy-docs.ts. cwd is pinned to tooling/ts so the bare `typedoc-github-theme` plugin resolves.
import { Application, TSConfigReader } from "typedoc";
import { join, dirname, relative, posix, sep } from "node:path";
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { generatePages, type DocPackage } from "./gen-doc-pages";
import { stripReadmeHeader } from "../packages/docs/src/index";

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
  // TypeDoc's default set + the extras our READMEs use (ini etc.) — highlightLanguages REPLACES the default.
  highlightLanguages: [
    "bash", "console", "css", "html", "javascript", "json", "jsonc", "json5", "yaml", "tsx", "typescript",
    "ini", "toml", "diff", "sql", "text",
  ],
  plugin: PLUGINS,
};

// Rewrite a doc's repo-relative markdown links to absolute GitHub URLs so umbrella / per-package renders carry no
// dangling relative links (TypeDoc warns it can't copy them, and they wouldn't resolve from the output dir).
// `tree/` for directories (e.g. a sibling package), `blob/` for files (e.g. a doc/ ADR or a local .md).
function absolutizeRepoLinks(md: string, relDir: string): string {
  const base = `${REPO_URL}`;
  return md.replace(/(\]\()([^)\s]+)([^)]*\))/g, (full, open: string, href: string, close: string) => {
    const h = href.trim();
    if (/^(?:[a-z][a-z0-9+.-]*:|#|\/\/|\/)/i.test(h)) return full; // absolute / anchor / root-relative → leave
    const hashAt = h.indexOf("#");
    const anchor = hashAt >= 0 ? h.slice(hashAt) : "";
    const path = (hashAt >= 0 ? h.slice(0, hashAt) : h).replace(/^\.\//, "");
    if (!path) return full; // bare #anchor
    const resolved = posix.normalize(`${relDir}/${path}`).replace(/^(?:\.\.\/)+/, "");
    const kind = /\.[a-z0-9]+$/i.test(resolved.split("/").pop() ?? "") ? "blob" : "tree";
    return `${open}${base}/${kind}/main/${resolved}${anchor}${close}`;
  });
}

// ── The Specification section (Suluk-the-OpenAPI-v4-candidate). Sourced from specification/ + the Rust core;
//    rendered as a nested "Specification" document tree in the umbrella. ──
const SPEC = join(REPO, "specification", "candidate-v4");
const SPEC_PAGES: { file: string; relDir: string; slug: string; title: string; stripBranding?: boolean }[] = [
  { file: join(SPEC, "SPEC.md"), relDir: "specification/candidate-v4", slug: "the-specification", title: "The Specification" },
  { file: join(SPEC, "signature-mechanism.md"), relDir: "specification/candidate-v4", slug: "signatures", title: "Signatures & Request Matching" },
  { file: join(SPEC, "templating-system.md"), relDir: "specification/candidate-v4", slug: "templating", title: "Templating System" },
  { file: join(SPEC, "parameter-schema.md"), relDir: "specification/candidate-v4", slug: "parameters", title: "Parameter Schema" },
  { file: join(SPEC, "collections-array-vs-map.md"), relDir: "specification/candidate-v4", slug: "collections", title: "Collections: Array vs Map" },
  { file: join(SPEC, "conformance", "CONFORMANCE.md"), relDir: "specification/candidate-v4/conformance", slug: "conformance", title: "Conformance" },
  { file: join(SPEC, "CONFIDENCE.md"), relDir: "specification/candidate-v4", slug: "confidence", title: "Confidence & Soft Points" },
  { file: join(REPO, "specification", "moonwalk-source.md"), relDir: "specification", slug: "moonwalk-priors", title: "Moonwalk Priors (upstream)" },
  { file: join(REPO, "tooling", "rust", "suluk-core", "README.md"), relDir: "tooling/rust/suluk-core", slug: "reference-core", title: "Reference Core — Rust (suluk-core)", stripBranding: true },
];

// Write one doc-page to `tmp`: strip branding header (READMEs) + a leading H1 (the frontmatter title is the
// heading), absolutize repo-relative links, prepend frontmatter.
function writeDoc(tmp: string, name: string, title: string, srcFile: string, relDir: string, stripBranding = false): void {
  let md = readFileSync(srcFile, "utf8");
  if (stripBranding) md = stripReadmeHeader(md);
  md = md.replace(/^﻿?\s*#\s+.*\r?\n/, ""); // drop a leading H1 to avoid a double heading under the title
  md = absolutizeRepoLinks(md, relDir);
  writeFileSync(join(tmp, name), `---\ntitle: ${JSON.stringify(title)}\n---\n\n${md.trim()}\n`);
}

// Stage EVERY umbrella document into `tmp` (one shared base dir) and return the readme + ordered
// projectDocuments. All-in-one-dir is deliberate: TypeDoc resolves a document's `children` relative to the
// COMMON directory of all projectDocuments — if they span docs-pages/ (deep in the repo) and /tmp, that common
// dir is `/` and the children glob ENOENTs. Staging the hand-authored/generated guides here too keeps it clean.
function generateUmbrellaDocs(tmp: string): { readme: string; projectDocuments: string[] } {
  const copy = (n: string): string => {
    const out = join(tmp, `${n}.md`);
    writeFileSync(out, readFileSync(join(TS, "docs-pages", `${n}.md`), "utf8"));
    return out;
  };
  const readme = copy("index");
  const guides = { gettingStarted: copy("getting-started"), architecture: copy("architecture"), packages: copy("packages"), contributing: copy("contributing"), community: copy("community") };

  const children: string[] = [];
  for (const p of SPEC_PAGES) {
    writeDoc(tmp, `spec-${p.slug}.md`, p.title, p.file, p.relDir, p.stripBranding);
    children.push(`./spec-${p.slug}.md`);
  }
  const specification = join(tmp, "specification.md");
  writeFileSync(
    specification,
    `---
title: Specification
children:
${children.map((c) => `  - ${c}`).join("\n")}
---

# Specification

**Suluk is a candidate exploration of OpenAPI v4.0 "Moonwalk"** — an independent, single-contributor draft of
the next OpenAPI. It is **not** the official specification and **not** SIG-ratified. This section is the
specification itself: the object model, request signatures, parameters, responses, schemas, components, and
security.

- **[The Specification](./spec-the-specification.md)** — the full candidate document (sections 1–9).
- **Design notes** — [Signatures](./spec-signatures.md) · [Templating](./spec-templating.md) · [Parameters](./spec-parameters.md) · [Collections](./spec-collections.md).
- **[Conformance](./spec-conformance.md)** — the valid/invalid test corpus + runner.
- **[Confidence & Soft Points](./spec-confidence.md)** — the honestly-low-ceiling parts.
- **[Reference Core — Rust](./spec-reference-core.md)** — the \`suluk-core\` performance implementation.
- **[Moonwalk Priors](./spec-moonwalk-priors.md)** — the upstream OAI source these decisions inherit from.

## Associated files

- **Meta-schema** — [\`v4-meta-schema.json\`](${REPO_URL}/blob/main/specification/candidate-v4/v4-meta-schema.json)
- **TypeScript types** — [\`v4-types.ts\`](${REPO_URL}/blob/main/specification/candidate-v4/v4-types.ts) (the v4 document object model)
- **Example document** — [\`petstore.suluk.yaml\`](${REPO_URL}/blob/main/specification/candidate-v4/examples/petstore.suluk.yaml)
- **Conformance corpus** — [\`conformance/\`](${REPO_URL}/tree/main/specification/candidate-v4/conformance)

> The specification is a **projection of the decision ledger** ([ADRs](${REPO_URL}/tree/main/doc/architecture/decisions), C001–C053), not the source of truth — see [Architecture](architecture.md).
`,
  );

  const registryMd = absolutizeRepoLinks(readFileSync(join(REPO, "registry", "README.md"), "utf8"), "registry")
    .replace(/^﻿?\s*#\s+.*\r?\n/, "");
  const registry = join(tmp, "registry.md");
  writeFileSync(registry, `---\ntitle: Registry\n---\n\n# Registry\n\n${registryMd.trim()}\n`);

  return {
    readme,
    projectDocuments: [guides.gettingStarted, guides.architecture, guides.packages, registry, specification, guides.contributing, guides.community],
  };
}

async function render(label: string, options: Record<string, unknown>): Promise<void> {
  // Only the TSConfigReader — deliberately NOT the TypeDocReader, so a stray tooling/ts/typedoc.json (e.g. an
  // old merged-render config) can never leak its entryPointStrategy/out into these explicit per-render options.
  const app = await Application.bootstrapWithPlugins(options, [new TSConfigReader()]);
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

  // Temp dir for generated/preprocessed docs (the whole umbrella doc set, and each package README below).
  const tmp = mkdtempSync(join(tmpdir(), "suluk-docs-"));
  const { readme, projectDocuments } = generateUmbrellaDocs(tmp);

  // 1. UMBRELLA first — its cleanOutputDir wipes docs/ (incl. a stale docs/packages/ from a prior build).
  console.log("• umbrella → docs/ …");
  await render("umbrella", {
    ...BASE,
    name: "Suluk",
    entryPoints: [], // documents-only
    readme,
    projectDocuments,
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
    let readme = "none";
    if (p.hasReadme) {
      const relDir = relative(REPO, p.dir).split(sep).join("/"); // e.g. tooling/ts/packages/hono
      const rewritten = absolutizeRepoLinks(readFileSync(join(p.dir, "README.md"), "utf8"), relDir);
      readme = join(tmp, `${p.slug}.md`);
      writeFileSync(readme, rewritten);
    }
    await render(p.name, {
      ...BASE,
      name: p.name,
      entryPoints: [join(p.dir, "src", "index.ts")],
      readme,
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

  rmSync(tmp, { recursive: true, force: true });
  console.log(`Built umbrella + ${pkgs.length} package roots → docs/`);
  return pkgs;
}

if (import.meta.main) await buildDocs();
