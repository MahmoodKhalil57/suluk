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
import { generatePages, documentedRegistry, type DocPackage, type RegistryItem } from "./gen-doc-pages";
import { stripReadmeHeader } from "../packages/docs/src/index";

const TS = join(dirname(new URL(import.meta.url).pathname), ".."); // tooling/ts
const REPO = join(TS, "..", "..");
// DOCS_OUT overrides the output root (for dev builds into a scratch dir); defaults to the repo docs/.
const DOCS = process.env.DOCS_OUT || join(REPO, "docs");
const UMBRELLA_URL = "https://mahmoodkhalil57.github.io/suluk/";
const REPO_URL = "https://github.com/MahmoodKhalil57/suluk";

// The two top-level nav groups (Suluk's two-layer identity: the candidate/spec, and the ecosystem it enables).
const CANDIDATE_GROUP = "Suluk independent OpenAPI v4.0 candidate";
const ECOSYSTEM_GROUP = "EcoSystem";

const UML = "https://cdn.jsdelivr.net/gh/MahmoodKhalil57/suluk@main/tooling/ts/docs-pages/registry-uml.svg";

const PLUGINS = [
  "typedoc-github-theme",
  join(TS, "scripts", "typedoc-vscode-icons.mjs"),
  join(TS, "scripts", "typedoc-branding-head.mjs"),
  join(TS, "packages", "typedoc-umlclass", "src", "index.js"), // d3 per-package UML class diagram on each module index
  "typedoc-plugin-skillit", // autogenerates SKILL.md + llms.txt (AI-agent skill) per root — configured per render below
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
  // skillit defaults: the per-render skillsOutDir / llmsTxt / llmsTxtOutDir are set below; keep the audit quiet
  // (its per-symbol JSDoc-gap log would flood a 60-root build; skillsAuditFailOnError is false by default anyway).
  skillsAudit: false,
  skillsMaxTokens: 6000,
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

/** Reverse map: each @suluk package name → the registry items that wire it (from registry.json dependencies). */
function registryConsumers(): Map<string, RegistryItem[]> {
  const m = new Map<string, RegistryItem[]>();
  for (const it of documentedRegistry()) {
    for (const dep of it.sulukDeps) {
      if (!m.has(dep)) m.set(dep, []);
      m.get(dep)!.push(it);
    }
  }
  return m;
}

/** skillit titles llms.txt from the cwd package.json (suluk-tooling); rewrite the H1 + blockquote. No-op if absent. */
function retitleLlms(outDir: string, title: string, description: string): void {
  for (const f of ["llms.txt", "llms-full.txt"]) {
    const p = join(outDir, f);
    if (!existsSync(p)) continue;
    const md = readFileSync(p, "utf8").replace(/^#[^\n]*\n(>[^\n]*\n)?/, `# ${title}\n\n> ${description}\n`);
    writeFileSync(p, md);
  }
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
function generateUmbrellaDocs(tmp: string, pkgs: DocPackage[], opts: { forMarkdown?: boolean } = {}): { readme: string; projectDocuments: string[] } {
  const copy = (n: string): string => {
    const out = join(tmp, `${n}.md`);
    writeFileSync(out, readFileSync(join(TS, "docs-pages", `${n}.md`), "utf8"));
    return out;
  };
  const readme = copy("index");

  // ── GUIDES folder: the framework guides, nested under one parent (a docs-folder → folder icon). ──
  for (const n of ["getting-started", "architecture", "contributing", "community"]) copy(n);
  const guides = join(tmp, "guides.md");
  writeFileSync(
    guides,
    `---\ntitle: Guides\ngroup: ${ECOSYSTEM_GROUP}\nchildren:\n  - ./getting-started.md\n  - ./architecture.md\n  - ./contributing.md\n  - ./community.md\n---\n\n# Guides\n\nHow to build on the Suluk framework: the 30-second tour, how one contract projects into a whole stack, and how to contribute.\n`,
  );

  // ── PACKAGES folder (HTML only): one entry PER package (title "@suluk/x vN" → npm glyph), each linking to that
  //    package's own root docs site. In the MARKDOWN mirror the packages are entry-point modules (a merged tree),
  //    so this stub folder is skipped there. ──
  let packages: string | undefined;
  if (!opts.forMarkdown) {
    const pkgChildren: string[] = [];
    const rows: string[] = [];
    for (const p of pkgs) {
      const url = `${UMBRELLA_URL}packages/${p.slug}/`;
      writeFileSync(
        join(tmp, `pkg-${p.slug}.md`),
        `---\ntitle: ${JSON.stringify(`${p.name}  v${p.version}`)}\n---\n\n# ${p.name}\n\n\`v${p.version}\`${p.description ? ` — ${p.description}` : ""}\n\n**[Open the full ${p.name} documentation →](${url})**\n`,
      );
      pkgChildren.push(`./pkg-${p.slug}.md`);
      rows.push(`- <a href="${url}"><code>${p.name}</code></a> <code>v${p.version}</code> — ${p.description || "&mdash;"}`);
    }
    packages = join(tmp, "packages.md");
    writeFileSync(
      packages,
      `---\ntitle: Packages\ngroup: ${ECOSYSTEM_GROUP}\nchildren:\n${pkgChildren.map((c) => `  - ${c}`).join("\n")}\n---\n\n# Packages\n\nEvery \`@suluk/*\` package is its **own complete documentation site**. Pick one from the **sidebar** (each shows its version) or the list below. ${pkgs.length} packages:\n\n${rows.join("\n")}\n`,
    );
  }

  // ── REGISTRY folder (group: EcoSystem): mirrors PACKAGES. In the HTML site each item is its OWN root
  //    (docs/registry/<name>/ — README + TS API + UML), so its nav entry is a stub linking there; in the
  //    MARKDOWN mirror (no per-item roots) the entry is the item's README inline. Both embed the arch graph. ──
  const items = documentedRegistry();
  const regChildren: string[] = [];
  const regRows: string[] = [];
  for (const it of items) {
    const url = `${UMBRELLA_URL}registry/${it.name}/`;
    if (opts.forMarkdown) {
      const readmePath = join(it.dir, "README.md");
      const body = existsSync(readmePath)
        ? absolutizeRepoLinks(readFileSync(readmePath, "utf8"), `registry/${it.name}`).replace(/^﻿?\s*#\s+.*\r?\n/, "")
        : `${it.description}\n\n\`\`\`bash\npnpm dlx shadcn@latest add MahmoodKhalil57/suluk/${it.name}\n\`\`\``;
      writeFileSync(join(tmp, `reg-${it.name}.md`), `---\ntitle: ${JSON.stringify(it.name)}\n---\n\n# ${it.title}\n\n${body.trim()}\n`);
      regRows.push(`- [**${it.name}**](./reg-${it.name}.md) — ${it.description || it.title}`);
    } else {
      const wires = it.sulukDeps.length ? `Wires ${it.sulukDeps.map((d) => `\`${d}\``).join(", ")}.` : "";
      const builds = it.regDeps.length ? ` Builds on ${it.regDeps.map((d) => `[\`${d}\`](./reg-${d}.md)`).join(", ")}.` : "";
      writeFileSync(
        join(tmp, `reg-${it.name}.md`),
        `---\ntitle: ${JSON.stringify(it.name)}\n---\n\n# ${it.title}\n\n${it.description}\n\n${wires}${builds}\n\n**[Open the full \`${it.name}\` docs — README · TypeScript API · UML diagram →](${url})**\n\n\`\`\`bash\npnpm dlx shadcn@latest add MahmoodKhalil57/suluk/${it.name}\n\`\`\`\n`,
      );
      regRows.push(`- <a href="${url}"><code>${it.name}</code></a> — ${it.description || it.title}`);
    }
    regChildren.push(`./reg-${it.name}.md`);
  }
  const registry = join(tmp, "registry.md");
  writeFileSync(
    registry,
    `---\ntitle: Registry\ngroup: ${ECOSYSTEM_GROUP}\nchildren:\n${regChildren.map((c) => `  - ${c}`).join("\n")}\n---\n\n# Registry\n\nThe [shadcn registry](${REPO_URL}/blob/main/registry/README.md) distributes the generic SaaS-backend modules as **code you own**, wired over the \`@suluk/*\` packages (own the wiring, npm the logic). Each item is its **own documentation site** — its README, the full TypeScript surface, and a UML class diagram. Here is how the ${items.length} modules build on each other (\`app\` is the foundation everything rests on):\n\n![Suluk registry — how the modules compose](${UML})\n\nInstall any item with:\n\n\`\`\`bash\npnpm dlx shadcn@latest add MahmoodKhalil57/suluk/<item>\n\`\`\`\n\n${items.length} items:\n\n${regRows.join("\n")}\n`,
  );

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
group: ${CANDIDATE_GROUP}
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

  // ── ECOSYSTEM VISION (group: candidate) — the bridge from the spec to the framework it enables. ──
  const vision = join(tmp, "ecosystem-vision.md");
  writeFileSync(
    vision,
    `---\ntitle: EcoSystem vision\ngroup: ${CANDIDATE_GROUP}\n---\n\n# EcoSystem vision\n\nSuluk is two things at once.\n\n**Layer 1 — the candidate specification.** An independent, single-contributor draft of OpenAPI v4.0 "Moonwalk" — the object model, request signatures, parameters, responses, schemas, components, and security. See the [Specification](specification.md).\n\n**Layer 2 — the ecosystem it makes possible.** Because the v4 document is a single typed contract, everything else can be **derived** from it — the API, a typed client, generated UI, contract tests, an admin panel, a Cloudflare deploy plan. That derivation *is* the framework:\n\n- a family of small **[\`@suluk/*\` packages](packages.md)** (the money/security/correctness **logic**),\n- a **[shadcn registry](registry.md)** of own-the-code backend modules (the app-owned **wiring**), and\n- declarative provisioning (\`@suluk/provision\`) + a manifest generator (\`@suluk/platform\`) that assembles a whole backend from one \`definePlatform\` call.\n\n**One source, many projections; they cannot drift because they are the same source.** The boundary rule (own the wiring, npm the logic) keeps a fix flowing to every consumer while leaving each app in control of its own routes and policy.\n\nStart with the **[Guides](guides.md)**, browse the **[Packages](packages.md)** and the **[Registry](registry.md)**, or read [how it all fits together](architecture.md).\n`,
  );

  const projectDocuments = [specification, vision, guides, packages, registry].filter((d): d is string => !!d);
  return { readme, projectDocuments };
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
  const { readme, projectDocuments } = generateUmbrellaDocs(tmp, allPkgs);

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
    // source-order keeps top-level docs in projectDocuments order within each group (Specification before the
    // vision; Guides/Packages/Registry in that order); folder children follow their `children:` list regardless.
    sort: ["source-order"],
    groupOrder: [CANDIDATE_GROUP, ECOSYSTEM_GROUP],
    // The whole-Suluk AI-agent surface (written by buildMarkdown/composeWholeSuluk) + the source.
    navigationLinks: {
      SKILL: `${UMBRELLA_URL}SKILL.md`,
      "llms.txt": `${UMBRELLA_URL}llms.txt`,
      GitHub: REPO_URL,
    },
  });

  // 2. PER-PACKAGE roots into docs/packages/<slug>/ (written after the umbrella clean, so they survive). Each root
  //    also gets skillit's SKILL.md + llms.txt (AI-agent surface) + a "used by these registry modules" projection.
  const consumers = registryConsumers();
  for (const p of pkgs) {
    const perDocs = join(p.dir, "docs-pages");
    const projectDocuments = existsSync(perDocs)
      ? readdirSync(perDocs)
          .filter((f) => f.endsWith(".md"))
          .sort()
          .map((f) => join(perDocs, f))
      : [];
    // Registry projection: the shadcn modules that wire THIS package (own-the-code backends built on it).
    const usedBy = consumers.get(p.name) ?? [];
    if (usedBy.length) {
      const rows = usedBy
        .map((it) => `- <a href="${UMBRELLA_URL}registry/${it.name}/"><code>${it.name}</code></a> — ${it.description || it.title}`)
        .join("\n");
      const projDoc = join(tmp, `used-by-${p.slug}.md`);
      writeFileSync(
        projDoc,
        `---\ntitle: Used by (registry)\ngroup: Documents\n---\n\n# Registry modules built on \`${p.name}\`\n\nThese [shadcn-registry](${UMBRELLA_URL}documents/Registry.html) modules wire \`${p.name}\` — own-the-code backends that build on this package (${usedBy.length}):\n\n${rows}\n`,
      );
      projectDocuments.push(projDoc);
    }
    let readme = "none";
    if (p.hasReadme) {
      const relDir = relative(REPO, p.dir).split(sep).join("/"); // e.g. tooling/ts/packages/hono
      const rewritten = absolutizeRepoLinks(readFileSync(join(p.dir, "README.md"), "utf8"), relDir);
      readme = join(tmp, `${p.slug}.md`);
      writeFileSync(readme, rewritten);
    }
    const out = join(DOCS, "packages", p.slug);
    const skillDir = `suluk-${p.slug}`; // skillit slugifies @suluk/<x> → suluk-<x>
    await render(p.name, {
      ...BASE,
      name: p.name,
      entryPoints: [join(p.dir, "src", "index.ts")],
      readme,
      projectDocuments,
      out,
      hostedBaseUrl: `${UMBRELLA_URL}packages/${p.slug}/`,
      sort: ["source-order"],
      // skillit → docs/packages/<slug>/skills/suluk-<slug>/SKILL.md + docs/packages/<slug>/llms.txt
      skillsOutDir: join(out, "skills"),
      llmsTxt: true,
      llmsTxtOutDir: out,
      // Absolute back-link + the AI-agent artifacts + the package's source on GitHub.
      navigationLinks: {
        "↑ Suluk": UMBRELLA_URL,
        SKILL: `${UMBRELLA_URL}packages/${p.slug}/skills/${skillDir}/SKILL.md`,
        "llms.txt": `${UMBRELLA_URL}packages/${p.slug}/llms.txt`,
        GitHub: `${REPO_URL}/tree/main/tooling/ts/packages/${p.dir.split("/").pop()}`,
      },
    });
    retitleLlms(out, p.name, p.description || "");
    console.log(`  ✓ ${p.name} → docs/packages/${p.slug}/ (+ SKILL.md + llms.txt)`);
  }

  // 3. PER-REGISTRY-ITEM roots into docs/registry/<name>/ (README + TS surface + UML), the registry analogue of
  //    the package roots. The items' `.ts` files live outside any package tsconfig, so we write ONE shared
  //    tsconfig (extends the base) listing every registry file, and each item's render selects its own subset as
  //    entry points. `DOCS_REG=a,b` limits the set for dev speed; `DOCS_NOREG=1` (or a DOCS_ONLY package filter) skips them.
  const regOnly = process.env.DOCS_REG?.split(",").map((s) => s.trim()).filter(Boolean);
  const skipReg = process.env.DOCS_NOREG === "1" || (!!only && !process.env.DOCS_REG);
  const regItems: RegistryItem[] = skipReg ? [] : documentedRegistry().filter((it) => (regOnly ? regOnly.includes(it.name) : true));
  if (regItems.length) {
    const allFiles = [...new Set(documentedRegistry().flatMap((it) => it.files))];
    const regTsconfig = join(tmp, "tsconfig.registry.json");
    writeFileSync(regTsconfig, JSON.stringify({
      extends: join(TS, "tsconfig.base.json"),
      compilerOptions: { types: ["bun"], noEmit: true },
      files: allFiles,
    }));
    for (const it of regItems) {
      if (!it.files.length) { console.log(`  – ${it.name} (no .ts files) — skipped`); continue; }
      let readme = "none";
      if (it.hasReadme) {
        const rewritten = absolutizeRepoLinks(readFileSync(join(it.dir, "README.md"), "utf8"), `registry/${it.name}`);
        readme = join(tmp, `regroot-${it.name}.md`);
        writeFileSync(readme, rewritten);
      }
      const out = join(DOCS, "registry", it.name);
      const skillDir = `suluk-registry-${it.name}`; // skillit slugifies the render name → suluk-registry-<name>
      await render(`registry/${it.name}`, {
        ...BASE,
        name: `@suluk/registry-${it.name}`, // skillit reads the render name for the skill slug/frontmatter
        tsconfig: regTsconfig,
        entryPoints: it.files,
        readme,
        out,
        hostedBaseUrl: `${UMBRELLA_URL}registry/${it.name}/`,
        sort: ["source-order"],
        skillsOutDir: join(out, "skills"),
        llmsTxt: true,
        llmsTxtOutDir: out,
        navigationLinks: {
          "↑ Suluk": UMBRELLA_URL,
          SKILL: `${UMBRELLA_URL}registry/${it.name}/skills/${skillDir}/SKILL.md`,
          "llms.txt": `${UMBRELLA_URL}registry/${it.name}/llms.txt`,
          GitHub: `${REPO_URL}/tree/main/registry/${it.name}`,
        },
      });
      retitleLlms(out, `${it.name} (registry module)`, it.description || it.title);
      console.log(`  ✓ registry/${it.name} → docs/registry/${it.name}/ (+ SKILL.md + llms.txt)`);
    }
  }

  rmSync(tmp, { recursive: true, force: true });
  console.log(`Built umbrella + ${pkgs.length} package roots + ${regItems.length} registry roots → docs/`);
  return pkgs;
}

/**
 * Build the MARKDOWN mirror of the docs (typedoc-plugin-markdown) into `documentation/` — a single, navigable
 * tree with **relative `.md` links** (GitHub-browsable, downloadable, offline). Same content as the HTML `docs/`,
 * "less pretty": one `entryPointStrategy: "packages"` render (all packages as modules in one tree) + the same
 * guides / specification / registry / vision documents. NO github-theme / icon / branding plugins (HTML-only).
 * `MD_OUT` overrides the output dir for dev builds.
 */
export async function buildMarkdown(): Promise<void> {
  process.chdir(TS);
  const pkgs = generatePages();
  const out = process.env.MD_OUT || join(REPO, "documentation");
  const tmp = mkdtempSync(join(tmpdir(), "suluk-md-"));
  const { readme, projectDocuments } = generateUmbrellaDocs(tmp, pkgs, { forMarkdown: true });

  console.log("• markdown → documentation/ …");
  await render("markdown", {
    plugin: ["typedoc-plugin-markdown", "typedoc-plugin-skillit"],
    entryPointStrategy: "packages",
    entryPoints: pkgs.map((p) => p.dir),
    packageOptions: { entryPoints: ["src/index.ts"], readme: "README.md", skipErrorChecking: true, excludeInternal: true, excludePrivate: true, includeVersion: true },
    readme,
    projectDocuments,
    name: "Suluk",
    out,
    cleanOutputDir: true,
    sort: ["source-order"],
    groupOrder: [CANDIDATE_GROUP, ECOSYSTEM_GROUP],
    // packages-mode reports internal-type refs (notExported) and the READMEs' ../sibling links (invalidPath) that
    // the HTML multi-root doesn't; they're build-noise, not user-facing (the links resolve within the md tree).
    validation: { notExported: false, invalidPath: false, invalidLink: true },
    // skillit over ALL packages at once → docs/skills/<pkg>/SKILL.md for each + docs/llms.txt for Suluk-as-a-whole.
    skillsAudit: false,
    skillsMaxTokens: 6000,
    skillsOutDir: join(DOCS, "skills"),
    llmsTxt: true,
    llmsTxtOutDir: DOCS,
  });
  rmSync(tmp, { recursive: true, force: true });
  // Whole-Suluk: retitle the project llms.txt + weave in the registry modules (on their own + under platform),
  // and compose the top-level SKILL.md agent skill that indexes every package + registry module.
  composeWholeSuluk(pkgs);
  console.log(`Built markdown mirror → ${out} (${pkgs.length} packages) + docs/llms.txt + docs/SKILL.md`);
}

/**
 * Compose the WHOLE-Suluk AI-agent surface at the docs site root: fix the skillit project llms.txt title, weave in
 * the shadcn registry modules (listed on their OWN + again UNDER @suluk/platform, which assembles them), and write
 * docs/SKILL.md — a single agent skill indexing every package + registry module + their per-root SKILL.md files.
 */
function composeWholeSuluk(pkgs: DocPackage[]): void {
  const reg = documentedRegistry();
  const SUMMARY = "Suluk = an OpenAPI v4.0 candidate spec + a contracts-in/everything-derived TypeScript framework: the @suluk/* packages (the npm logic) and a shadcn registry of own-the-code backend modules (the app-owned wiring).";
  const regOwn = reg.map((it) => `- [${it.name}](registry/${it.name}/): ${it.description || it.title}`).join("\n");
  const regUnderPlatform = reg.map((it) => `  - ${it.name} — ${it.description || it.title}`).join("\n");

  // ── augment the plugin's project llms.txt (+ llms-full.txt): retitle, then append the registry sections. ──
  retitleLlms(DOCS, "Suluk", SUMMARY);
  const regBlock = `\n## Registry modules (own-the-code backends)\n\nInstall with \`pnpm dlx shadcn@latest add MahmoodKhalil57/suluk/<item>\`. Each wires the @suluk packages above.\n\n${regOwn}\n\n## Platform assembly\n\n\`@suluk/platform\` (\`definePlatform\`) + \`@suluk/provision\` assemble the registry modules into a running backend. The modules platform composes:\n\n${regUnderPlatform}\n`;
  for (const f of ["llms.txt", "llms-full.txt"]) {
    const p = join(DOCS, f);
    if (existsSync(p)) writeFileSync(p, readFileSync(p, "utf8").trimEnd() + "\n" + regBlock);
  }

  // ── the whole-Suluk SKILL.md (agent skill) — an index over the autogenerated per-root skills. ──
  const pkgRows = pkgs
    .map((p) => `- **${p.name}** \`v${p.version}\` — ${p.description || "—"} · [docs](packages/${p.slug}/) · [SKILL](packages/${p.slug}/skills/suluk-${p.slug}/SKILL.md)`)
    .join("\n");
  const regRows = reg
    .map((it) => `- **${it.name}** — ${it.description || it.title} · [docs](registry/${it.name}/)${it.files.length ? ` · [SKILL](registry/${it.name}/skills/suluk-registry-${it.name}/SKILL.md)` : ""}`)
    .join("\n");
  const skill = `---
name: suluk
description: ${JSON.stringify(SUMMARY)}
---

# Suluk

${SUMMARY}

Two layers, one source: the v4 **contract** is authored once; the API, typed client, UI, tests, admin panel and deploy plan are all **projections** of it. The \`@suluk/*\` packages hold the reusable logic; the registry modules are the own-the-code wiring you copy into an app.

## Packages (${pkgs.length}) — the npm logic

Each package is its own documentation site with an autogenerated SKILL.md + llms.txt.

${pkgRows}

## Registry modules (${reg.length}) — the app-owned wiring

Own-the-code backend modules distributed via a [shadcn registry](registry/), wired over the \`@suluk/*\` packages. Install any item:

\`\`\`bash
pnpm dlx shadcn@latest add MahmoodKhalil57/suluk/<item>
\`\`\`

${regRows}

## Platform assembly

\`@suluk/platform\` (\`definePlatform\`) + \`@suluk/provision\` assemble the registry modules above into a running backend — one manifest declares the services, and the registry modules are the wiring that manifest provisions. See the [registry architecture graph](documents/Registry.html) for how the modules build on each other (\`app\` is the foundation).

## Machine-readable index

- Whole-Suluk: [llms.txt](llms.txt) · [llms-full.txt](llms-full.txt)
- Per package: \`packages/<name>/llms.txt\` + \`packages/<name>/skills/suluk-<name>/SKILL.md\`
- Per registry module: \`registry/<name>/llms.txt\` + \`registry/<name>/skills/suluk-registry-<name>/SKILL.md\`
`;
  writeFileSync(join(DOCS, "SKILL.md"), skill);
}

if (import.meta.main) {
  if (process.argv.includes("--markdown")) await buildMarkdown();
  else await buildDocs();
}
