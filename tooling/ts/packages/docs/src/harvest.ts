/**
 * Harvest a Bun/TS monorepo into a documentation model — straight from source, the Suluk way. For each
 * package it reads package.json (name/description/version/deps), the leading doc-comment of src/index.ts (the
 * package overview — these are already written on every Suluk barrel), the public exports, and each module's
 * leading doc-comment. No build, no annotations beyond what the code already carries.
 */
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, basename, relative } from "node:path";

export interface ModuleDoc {
  file: string;
  doc: string;
}

export interface PackageDoc {
  name: string;
  slug: string;
  description: string;
  version: string;
  private: boolean;
  dependencies: string[];
  peerDependencies: string[];
  /** Markdown prose from the leading /** *\/ doc-comment of src/index.ts. */
  overview: string;
  /** The package's README.md, verbatim (the hand-written usage docs), or "" if it has none. */
  readme: string;
  /** The package directory relative to the repo root (e.g. `tooling/ts/packages/core`) — used to rewrite README links. */
  repoRelDir: string;
  /** Public symbols re-exported from the barrel. */
  exports: string[];
  /** Per-module leading doc-comments. */
  modules: ModuleDoc[];
}

export interface FrameworkDoc {
  title: string;
  tagline: string;
  description: string;
  repoUrl: string;
  packages: PackageDoc[];
  /** ARCHITECTURE.md (markdown), if present. */
  architecture?: string;
}

/** Extract + clean the first JSDoc block comment. */
export function firstBlockComment(src: string): string {
  const m = /\/\*\*([\s\S]*?)\*\//.exec(src);
  if (!m) return "";
  return m[1].split("\n").map((l) => l.replace(/^\s*\* ?/, "").replace(/^\s*\*$/, "")).join("\n").trim();
}

/** Collect the public symbol names a barrel re-exports. */
export function parseExports(src: string): string[] {
  const names = new Set<string>();
  for (const m of src.matchAll(/export\s+(?:type\s+)?\{([^}]+)\}/g)) {
    for (let n of m[1].split(",")) {
      n = n.trim().replace(/^type\s+/, "");
      n = n.split(/\s+as\s+/).pop()!.trim();
      if (n && /^[A-Za-z_]/.test(n)) names.add(n);
    }
  }
  for (const m of src.matchAll(/export\s+(?:async\s+)?(?:function|const|class|interface|type|enum)\s+([A-Za-z0-9_]+)/g)) names.add(m[1]);
  return [...names].sort((a, b) => a.localeCompare(b));
}

const slugify = (s: string) => s.replace(/^@/, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase();

/**
 * Strip a README's leading branding/header chrome so it integrates under the site's own page title without a
 * duplicate logo + H1. Handles both house styles: the centered-logo HTML header (`<p align="center">…</p>` +
 * `<h1 align="center">` + taglines + `---`) and the plain `# @pkg` H1 followed by a bold one-line value-prop.
 * Everything from the first real content line (the CANDIDATE note / intro prose / first `##`) is kept.
 */
export function stripReadmeHeader(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  let i = 0;
  const blank = (l?: string) => (l ?? "").trim() === "";
  const isMd = (l?: string) => /^\s*(#{1,6}\s|>\s?|```|\|)/.test(l ?? "");
  const isRule = (l?: string) => /^\s*---\s*$/.test(l ?? "");
  while (i < lines.length && blank(lines[i])) i++;
  if ((lines[i] ?? "").trimStart().startsWith("<")) {
    // Family A — leading HTML branding block: consume HTML/blank lines until markdown content or a rule.
    while (i < lines.length && !isMd(lines[i]) && !isRule(lines[i])) i++;
    while (i < lines.length && blank(lines[i])) i++;
    if (isRule(lines[i])) { i++; while (i < lines.length && blank(lines[i])) i++; }
  } else if (/^#\s/.test(lines[i] ?? "")) {
    // Family B — plain `# @pkg` H1, then maybe a bold-only one-liner value prop.
    i++;
    while (i < lines.length && blank(lines[i])) i++;
    if (/^\*\*.+\*\*\s*$/.test((lines[i] ?? "").trim())) { i++; while (i < lines.length && blank(lines[i])) i++; }
  }
  return lines.slice(i).join("\n").trim();
}

export function harvestPackage(dir: string, repoRoot?: string): PackageDoc | null {
  const pkgPath = join(dir, "package.json");
  if (!existsSync(pkgPath)) return null;
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as Record<string, unknown>;
  const indexPath = join(dir, "src", "index.ts");
  const index = existsSync(indexPath) ? readFileSync(indexPath, "utf8") : "";
  const readmePath = join(dir, "README.md");
  const readme = existsSync(readmePath) ? readFileSync(readmePath, "utf8") : "";

  const modules: ModuleDoc[] = [];
  const srcDir = join(dir, "src");
  if (existsSync(srcDir)) {
    for (const f of readdirSync(srcDir).filter((f) => f.endsWith(".ts") && f !== "index.ts").sort()) {
      const doc = firstBlockComment(readFileSync(join(srcDir, f), "utf8"));
      if (doc) modules.push({ file: f, doc });
    }
  }
  const name = String(pkg.name ?? basename(dir));
  return {
    name,
    slug: slugify(name),
    description: String(pkg.description ?? ""),
    version: String(pkg.version ?? "0.0.0"),
    private: !!pkg.private,
    dependencies: Object.keys((pkg.dependencies as object) ?? {}),
    peerDependencies: Object.keys((pkg.peerDependencies as object) ?? {}),
    overview: firstBlockComment(index),
    readme,
    repoRelDir: (repoRoot ? relative(repoRoot, dir) : basename(dir)).split("\\").join("/"),
    exports: parseExports(index),
    modules,
  };
}

export interface HarvestOptions {
  packagesDir: string;
  title: string;
  tagline: string;
  description: string;
  repoUrl: string;
  architecturePath?: string;
  /** Repo root — when given, each package's README links resolve against its path from here (→ GitHub blob URLs). */
  repoRoot?: string;
  /** Exclude private/example packages from the public docs (default false — include them, flagged). */
  excludePrivate?: boolean;
}

export function harvest(opts: HarvestOptions): FrameworkDoc {
  const dirs = readdirSync(opts.packagesDir).filter((d) => {
    try { return statSync(join(opts.packagesDir, d)).isDirectory(); } catch { return false; }
  });
  let packages = dirs.map((d) => harvestPackage(join(opts.packagesDir, d), opts.repoRoot)).filter((p): p is PackageDoc => !!p);
  if (opts.excludePrivate) packages = packages.filter((p) => !p.private);
  packages.sort((a, b) => a.name.localeCompare(b.name));
  const architecture = opts.architecturePath && existsSync(opts.architecturePath) ? readFileSync(opts.architecturePath, "utf8") : undefined;
  return { title: opts.title, tagline: opts.tagline, description: opts.description, repoUrl: opts.repoUrl, packages, architecture };
}
