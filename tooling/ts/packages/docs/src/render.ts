/**
 * Render a harvested FrameworkDoc into a static, GitHub-Pages-ready site (flat HTML files + one stylesheet,
 * relative links so it serves correctly from a project-pages subpath). Every page is server-rendered HTML —
 * no client build, nothing to install to read the docs.
 *
 * Styling is entirely here, in the generator: pages load Tailwind + daisyUI from a CDN (static, no build) and
 * the chrome is daisyUI components. A package author NEVER writes UI — they only write a structured README, and
 * the generator projects it into a themed page. The only hand-written CSS is a compact `.prose-suluk` block that
 * re-applies readable typography to the rendered Markdown (Tailwind's preflight resets bare tags).
 */
import type { FrameworkDoc, PackageDoc } from "./harvest";
import { stripReadmeHeader } from "./harvest";
import { mdToHtml, inline, escapeHtml, rewriteRepoLinks } from "./md";

/** The static, no-build styling stack (daisyUI components + themes, Tailwind utilities via the browser CDN). */
const CDN = `<link href="https://cdn.jsdelivr.net/npm/daisyui@5" rel="stylesheet" type="text/css" />
<link href="https://cdn.jsdelivr.net/npm/daisyui@5/themes.css" rel="stylesheet" type="text/css" />
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>`;

/** daisyUI built-in theme for the site (swap this one string to re-skin everything). */
const THEME = "dim";

const NAV = [
  ["index.html", "Home"],
  ["getting-started.html", "Get started"],
  ["index.html#packages", "Packages"],
  ["architecture.html", "Architecture"],
  ["contributing.html", "Contributing"],
  ["community.html", "Community"],
] as const;

function layout(fw: FrameworkDoc, active: string, title: string, body: string): string {
  const nav = NAV.map(([href, label]) => {
    const on = href.startsWith(active) && active !== "" ? ' class="text-primary font-medium"' : "";
    return `<li><a href="${href}"${on}>${label}</a></li>`;
  }).join("");
  return `<!doctype html><html lang="en" data-theme="${THEME}"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<link rel="icon" type="image/svg+xml" href="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/favicon.svg"/>
<link rel="icon" type="image/png" sizes="32x32" href="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/icon-32.png"/>
<title>${escapeHtml(title)} — ${escapeHtml(fw.title)}</title>
<meta property="og:type" content="website"/>
<meta property="og:title" content="${escapeHtml(title)} — ${escapeHtml(fw.title)}"/>
<meta property="og:description" content="One typed OpenAPI v4 contract, projected into every full-stack layer."/>
<meta property="og:image" content="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/social-card.png"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:image" content="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/social-card.png"/>
${CDN}
<link rel="stylesheet" href="style.css"/>
</head><body class="min-h-screen bg-base-100 text-base-content">
<header class="navbar sticky top-0 z-30 bg-base-200/80 backdrop-blur border-b border-base-300 px-4">
  <div class="flex-1"><a class="text-primary font-bold tracking-wide text-lg" href="index.html">${escapeHtml(fw.title)}</a></div>
  <nav class="flex-none"><ul class="menu menu-horizontal gap-1 px-1 text-sm">${nav}<li><a class="text-info" href="${fw.repoUrl}">GitHub ↗</a></li></ul></nav>
</header>
<main class="max-w-4xl mx-auto px-4 py-10">${body}</main>
<footer class="footer footer-center border-t border-base-300 p-6 text-base-content/60 text-xs">
  <p>CANDIDATE — not official OpenAPI. Generated from source by <code>@suluk/docs</code>.</p>
</footer>
</body></html>`;
}

function packageCard(p: PackageDoc): string {
  const tag = p.private ? ' <span class="badge badge-sm badge-warning">demo</span>' : "";
  return `<a class="card bg-base-200 border border-base-300 hover:border-primary transition-colors" href="${p.slug}.html">
    <div class="card-body p-4 gap-1">
      <h3 class="card-title text-sm font-mono text-primary">${escapeHtml(p.name)}${tag}</h3>
      <p class="text-sm text-base-content/70 m-0">${inline(p.description)}</p>
    </div>
  </a>`;
}

const CYCLE = `Drizzle  ──▶  contract (Hono + Zod + Better Auth)  ──▶  v4 document (the hub)
  data                                                          │
                       ┌──────────────────────────────────────┼─────────────────────────────┐
                       ▼                  ▼                    ▼                ▼              ▼
                  Scalar / Swagger   Nano Stores          shadcn UI       contract tests   doc audit
                     (docs)         (client state)          (UI)           (the doc as a    (coverage)
                                                                            check)
        @suluk/builder composes it (pages → sections → blocks → components, contract-narrowing)
        @suluk/deploy ships it to Cloudflare · @suluk/cockpit drives it (vscode + /superadmin)`;

export function renderIndex(fw: FrameworkDoc): string {
  const cards = fw.packages.map(packageCard).join("\n");
  const body = `
  <section class="hero">
    <div class="hero-content text-center py-10">
      <div class="max-w-2xl">
        <h1 class="text-5xl font-bold">${escapeHtml(fw.title)}</h1>
        <p class="py-5 text-lg text-base-content/70">${inline(fw.tagline)}</p>
        <div class="flex gap-2 justify-center flex-wrap">
          <a class="btn btn-primary" href="getting-started.html">Get started</a>
          <a class="btn btn-outline" href="architecture.html">How it works</a>
          <a class="btn btn-ghost" href="${fw.repoUrl}">Star on GitHub</a>
        </div>
      </div>
    </div>
  </section>
  <section class="prose-suluk">${mdToHtml(fw.description)}</section>
  <section class="mt-8"><h2 class="text-primary font-semibold uppercase tracking-wide text-sm mb-3">The cycle</h2>
    <pre class="bg-base-200 border border-base-300 rounded-box p-4 overflow-auto text-xs text-base-content/70 leading-relaxed">${escapeHtml(CYCLE)}</pre>
  </section>
  <section id="packages" class="mt-10"><h2 class="text-primary font-semibold uppercase tracking-wide text-sm mb-3">Packages <span class="text-base-content/50">(${fw.packages.length})</span></h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">${cards}</div>
  </section>`;
  return layout(fw, "index.html", "Home", body);
}

export function renderPackage(fw: FrameworkDoc, p: PackageDoc): string {
  const hasReadme = p.readme.trim().length > 0;
  // The README is the hand-written package doc — render it as the page body (header chrome stripped, repo-relative
  // links pointed at GitHub). Fall back to the synthesized overview only when a package has no README.
  const docHtml = hasReadme
    ? mdToHtml(rewriteRepoLinks(stripReadmeHeader(p.readme), fw.repoUrl, p.repoRelDir))
    : `<h2>Overview</h2>${mdToHtml(p.overview || "_No overview._")}`;
  // A synthesized Install only when the README doesn't already carry one (so we never duplicate it).
  const install = (!p.private && !/\bbun add\b/.test(p.readme))
    ? `<h2>Install</h2><pre><code>bun add ${escapeHtml(p.name)}</code></pre>`
    : "";
  // Derived appendices — auto-synced facts that can't go stale (the README's prose is primary; these complement it).
  const chips = (items: string[], cls: string) =>
    `<div class="flex flex-wrap gap-2 mb-2">${items.map((e) => `<span class="badge badge-sm ${cls} font-mono">${escapeHtml(e)}</span>`).join("")}</div>`;
  const exportsHtml = p.exports.length ? `<h2>Public API</h2>${chips(p.exports, "badge-outline")}` : "";
  const deps = [...p.dependencies, ...p.peerDependencies.map((d) => d + " (peer)")];
  const depsHtml = deps.length ? `<h2>Depends on</h2>${chips(deps, "badge-ghost")}` : "";
  // Per-module blurbs are superseded by the README when one exists.
  const modulesHtml = !hasReadme && p.modules.length
    ? `<h2>Modules</h2><dl class="modules">${p.modules.map((m) => `<dt><code>${escapeHtml(m.file)}</code></dt><dd>${inline(m.doc.split("\n").find((l) => l.trim()) ?? "")}</dd>`).join("")}</dl>`
    : "";
  const body = `
  <article>
    <div class="text-sm breadcrumbs text-base-content/60"><ul><li><a href="index.html#packages">Packages</a></li><li>${escapeHtml(p.name)}</li></ul></div>
    <div class="flex items-center gap-3 flex-wrap mt-1">
      <h1 class="text-3xl font-bold font-mono">${escapeHtml(p.name)}</h1>
      <span class="badge badge-ghost">v${escapeHtml(p.version)}</span>
    </div>
    <p class="text-lg text-base-content/70 mt-2">${inline(p.description)}</p>
    <div class="prose-suluk mt-6">
      ${install}
      ${docHtml}
      ${exportsHtml}
      ${depsHtml}
      ${modulesHtml}
    </div>
  </article>`;
  return layout(fw, `${p.slug}.html`, p.name, body);
}

export function renderMarkdownPage(fw: FrameworkDoc, file: string, title: string, md: string): string {
  return layout(fw, file, title, `<article class="prose-suluk">${mdToHtml(md)}</article>`);
}

/**
 * The only hand-written CSS: typography for the rendered Markdown. daisyUI + Tailwind (from the CDN) own all the
 * chrome; this re-applies readable defaults to the bare tags Tailwind's preflight strips. Colors prefer the
 * daisyUI theme variables, with Suluk-brand fallbacks so it looks right even before the CDN settles.
 */
export const STYLE = `
/* Base-color safety net: the daisyUI theme vars drive these, with Suluk-dark fallbacks so the page is never
   unstyled even before/without the CDN's runtime utilities. */
body { background: var(--color-base-100, #0b0e14); color: var(--color-base-content, #cdd6f4); }
.navbar { background: color-mix(in oklab, var(--color-base-200, #11141c) 85%, transparent); }
.card { background: var(--color-base-200, #11141c); }
.prose-suluk { line-height: 1.7; }
.prose-suluk > :first-child { margin-top: 0; }
.prose-suluk h1 { font-size: 1.55rem; font-weight: 700; margin: 1.2rem 0 .6rem; }
.prose-suluk h2 { font-size: .9rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--color-primary, #f5a97f); margin: 1.8rem 0 .7rem; }
.prose-suluk h3 { font-size: 1.05rem; font-weight: 600; margin: 1.3rem 0 .4rem; }
.prose-suluk p { margin: .65rem 0; }
.prose-suluk ul { list-style: disc; padding-left: 1.4rem; margin: .65rem 0; }
.prose-suluk ol { list-style: decimal; padding-left: 1.4rem; margin: .65rem 0; }
.prose-suluk li { margin: .25rem 0; }
.prose-suluk li > ul, .prose-suluk li > ol { margin: .2rem 0; }
.prose-suluk a { color: var(--color-info, #8aadf4); text-decoration: underline; text-underline-offset: 2px; }
.prose-suluk strong { font-weight: 700; }
.prose-suluk code { background: var(--color-base-200, #1e2433); border-radius: .35rem; padding: .12em .4em; font-size: .9em; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.prose-suluk pre { background: var(--color-base-300, #11141c); border: 1px solid var(--color-base-300, #1e2433); border-radius: .6rem; padding: 1rem; overflow: auto; margin: .9rem 0; }
.prose-suluk pre code { background: none; border: 0; padding: 0; font-size: .85rem; }
.prose-suluk table { width: 100%; border-collapse: collapse; margin: .9rem 0; font-size: .9rem; display: block; overflow-x: auto; }
.prose-suluk th, .prose-suluk td { text-align: left; padding: .45rem .7rem; border-bottom: 1px solid var(--color-base-300, #1e2433); vertical-align: top; }
.prose-suluk th { color: var(--color-base-content, #cdd6f4); opacity: .7; font-weight: 600; }
.prose-suluk blockquote { border-left: 3px solid var(--color-primary, #f5a97f); padding: .2rem .9rem; margin: .9rem 0; opacity: .85; }
.prose-suluk hr { border: 0; border-top: 1px solid var(--color-base-300, #1e2433); margin: 1.4rem 0; }
.prose-suluk img { max-width: 100%; }
.modules dt { color: var(--color-primary, #f5a97f); margin-top: .5rem; font-family: ui-monospace, monospace; }
.modules dd { margin: .15rem 0 0 0; opacity: .7; }
`;

export interface SiteFile { path: string; content: string }
