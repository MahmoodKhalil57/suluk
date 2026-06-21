import { test, expect, describe } from "bun:test";
import { join } from "node:path";
import { harvest, generateSite, mdToHtml, parseExports, firstBlockComment, packageGraphD2, stripReadmeHeader, rewriteRepoLinks } from "../src/index";

const packagesDir = join(import.meta.dir, "..", ".."); // tooling/ts/packages
const repoRoot = join(packagesDir, "..", "..", "..");   // repo root

const fw = harvest({
  packagesDir,
  repoRoot,
  title: "Suluk",
  tagline: "One typed contract, projected into your whole stack.",
  description: "Suluk derives the **whole stack** from one source.",
  repoUrl: "https://github.com/MahmoodKhalil57/suluk",
});

describe("mdToHtml", () => {
  test("renders headings, code, lists, tables, inline", () => {
    const html = mdToHtml("# Title\n\nsome **bold** and `code` and [a](b)\n\n- one\n- two\n\n\`\`\`ts\nconst x = 1;\n\`\`\`\n\n| a | b |\n|---|---|\n| 1 | 2 |");
    expect(html).toContain("<h1>Title</h1>");
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<code>code</code>");
    expect(html).toContain('<a href="b">a</a>');
    expect(html).toContain("<li>one</li>");
    expect(html).toContain("<pre><code");
    expect(html).toContain("<table>");
  });
  test("escapes HTML in text + code", () => {
    expect(mdToHtml("a <script>x</script>")).toContain("&lt;script&gt;");
  });
});

describe("harvest — straight from the real monorepo source", () => {
  test("finds the Suluk packages with names + descriptions + overviews", () => {
    expect(fw.packages.length).toBeGreaterThanOrEqual(15);
    const core = fw.packages.find((p) => p.name === "@suluk/core")!;
    expect(core).toBeDefined();
    expect(core.description.length).toBeGreaterThan(10);
    expect(core.overview).toContain("foundation"); // from core/src/index.ts's leading doc-comment
    expect(core.exports).toContain("parseDocument");
  });
  test("parseExports collects barrel re-exports (names + types)", () => {
    const ex = parseExports(`export { a, b as c } from "./x";\nexport type { T } from "./y";\nexport function fn(){}`);
    expect(ex).toEqual(["a", "c", "fn", "T"]);
  });
  test("firstBlockComment strips the JSDoc markers", () => {
    expect(firstBlockComment("/**\n * hello\n * world\n */\ncode")).toBe("hello\nworld");
  });
  test("harvests each package's README + its repo-relative dir", () => {
    const core = fw.packages.find((p) => p.name === "@suluk/core")!;
    expect(core.readme).toContain("bun add @suluk/core"); // the hand-written usage doc is captured
    expect(core.repoRelDir).toBe("tooling/ts/packages/core");
  });
});

describe("stripReadmeHeader — drops branding chrome, keeps the doc body", () => {
  test("Family A — centered-logo HTML header is removed, content from the CANDIDATE note kept", () => {
    const md = [
      '<p align="center"><a href="x"><img src="wordmark.png"/></a></p>',
      "",
      '<h1 align="center">@suluk/x</h1>',
      "",
      '<p align="center"><b>One-line value prop.</b></p>',
      "",
      "---",
      "",
      "> **CANDIDATE tooling.**",
      "",
      "## Install",
      "",
      "bun add @suluk/x",
    ].join("\n");
    const body = stripReadmeHeader(md);
    expect(body.startsWith("> **CANDIDATE")).toBe(true);
    expect(body).toContain("## Install");
    expect(body).not.toContain('align="center"');
    expect(body).not.toContain("<h1");
  });
  test("Family B — plain '# @pkg' H1 + bold one-liner removed, intro prose kept", () => {
    const md = "# @suluk/x\n\n**One-line value prop.**\n\nIntro prose stays.\n\n## Usage\n";
    const body = stripReadmeHeader(md);
    expect(body).toBe("Intro prose stays.\n\n## Usage");
    expect(body).not.toContain("One-line value prop");
  });
});

describe("rewriteRepoLinks — repo-relative README links become GitHub blob URLs", () => {
  const repo = "https://github.com/MahmoodKhalil57/suluk";
  const rel = "tooling/ts/packages/core";
  test("a '../../../../doc' link resolves against the package dir to a blob URL", () => {
    expect(rewriteRepoLinks("[C033](../../../../doc/architecture/decisions/C033-x.md)", repo, rel))
      .toBe(`[C033](${repo}/blob/main/doc/architecture/decisions/C033-x.md)`);
  });
  test("a sibling-package link keeps its anchor", () => {
    expect(rewriteRepoLinks("[hono](../hono/README.md#usage)", repo, rel))
      .toBe(`[hono](${repo}/blob/main/tooling/ts/packages/hono/README.md#usage)`);
  });
  test("absolute links and pure anchors are left untouched", () => {
    expect(rewriteRepoLinks("[s](https://example.com) and [a](#section)", repo, rel))
      .toBe("[s](https://example.com) and [a](#section)");
  });
});

describe("generateSite — a complete static site", () => {
  const files = generateSite(fw);
  const byPath = new Map(files.map((f) => [f.path, f.content]));

  test("emits index, a page per package, architecture, the curated pages, css, .nojekyll", () => {
    expect(byPath.has("index.html")).toBe(true);
    expect(byPath.has("style.css")).toBe(true);
    expect(byPath.has(".nojekyll")).toBe(true);
    expect(byPath.has("getting-started.html")).toBe(true);
    expect(byPath.has("contributing.html")).toBe(true);
    expect(byPath.has("community.html")).toBe(true);
    for (const p of fw.packages) expect(byPath.has(`${p.slug}.html`)).toBe(true);
  });
  test("the landing lists every package and the cycle", () => {
    const index = byPath.get("index.html")!;
    expect(index).toContain("@suluk/core");
    expect(index).toContain("@suluk/builder");
    expect(index).toContain("The cycle");
    expect(index).toContain('href="suluk-core.html"');
  });
  test("a package page renders the README as the body + the derived Public API", () => {
    const core = byPath.get("suluk-core.html")!;
    expect(core).toContain("bun add @suluk/core"); // from the README's own Install (synthesized one suppressed)
    expect(core).toContain("Public API");          // the derived, can't-go-stale appendix
    expect(core).toContain("parseDocument");
    expect(core).not.toContain("<h2>Overview</h2>"); // the README supersedes the synthesized overview
  });
  test("the community page explains building libraries via the shadcn registry", () => {
    expect(byPath.get("community.html")!).toContain("registry");
    expect(byPath.get("community.html")!).toContain("discussions");
  });
  test("links are relative (GitHub-Pages-subpath safe)", () => {
    expect(byPath.get("index.html")!).not.toContain('href="/');
  });
});

describe("packageGraphD2 — the 'how the tools compose' diagram (D2)", () => {
  test("emits a node per visible package and edges to its @suluk deps", () => {
    const d2 = packageGraphD2(fw.packages);
    expect(d2).toContain("cockpit: {"); // a node for @suluk/cockpit
    expect(d2).toContain("core: {");
    // cockpit depends on core → an edge (short ids, @suluk/ stripped)
    expect(d2).toMatch(/cockpit -> core/);
    expect(d2).not.toContain("@suluk/"); // ids are the short names
  });
  test("the site commits architecture.d2 and renders the diagram on the Architecture page", () => {
    const byPath = new Map(generateSite(fw).map((f) => [f.path, f.content]));
    expect(byPath.has("architecture.d2")).toBe(true);
    expect(byPath.get("architecture.d2")!).toContain("how the tools compose");
    const arch = byPath.get("architecture.html")!;
    expect(arch).toContain("How the tools compose");
    expect(arch).toMatch(/<img[^>]+src="https:\/\/kroki\.io\/d2\/svg\//); // the diagram is a real <img>, not a stray link
  });
});

describe("mdToHtml — image rule (regression)", () => {
  test("![alt](url) renders an <img>, not a stray ! + link", () => {
    const html = mdToHtml("![A diagram](https://example.com/x.svg)");
    expect(html).toMatch(/<img[^>]+src="https:\/\/example\.com\/x\.svg"/);
    expect(html).not.toContain("!<a"); // no stray bang before a link
  });
  test("a normal [text](url) link still works alongside the image rule", () => {
    expect(mdToHtml("see [docs](https://d2lang.com)")).toContain('<a href="https://d2lang.com">docs</a>');
  });
});
