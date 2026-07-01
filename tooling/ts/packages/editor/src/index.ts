/**
 * `@suluk/editor` — a fully-static, client-only OpenAPI **v4** editor (the editor.scalar.com analog, native v4).
 *
 * `editorHtml(opts)` emits ONE self-contained HTML page: a CodeMirror source pane on the left, a live API reference
 * (rendered by the suluk Scalar fork) on the right, a diagnostics bar below, and a toolbar (format toggle, examples,
 * 3.1→v4 upgrade, "show as 3.1" downgrade preview, share link). Everything runs in the browser — the page loads the
 * Scalar fork bundle (`forkSrc`, defines window.Scalar) and the editor client bundle (`clientSrc`, built into ./dist);
 * there are no server calls. Host the three assets anywhere static. See C033.
 */
import { examples as defaultExamples, defaultExample, type EditorExample } from "./examples";

export type { EditorExample } from "./examples";
export { examples, defaultExample } from "./examples";

export interface EditorOptions {
  /** Browser <title> + toolbar heading suffix. */
  pageTitle?: string;
  /** Brand shown in the toolbar (default "Suluk"). */
  brand?: string;
  /** URL of the suluk Scalar fork standalone bundle (defines window.Scalar). Default "/vendor/scalar/standalone-suluk.js". */
  forkSrc?: string;
  /** URL of the built editor client bundle (this package's dist/editor.client.js). Default "/editor.client.js". */
  clientSrc?: string;
  /** Favicon href. */
  faviconHref?: string;
  /** Seed documents for the Examples dropdown (default: this package's examples). */
  examples?: EditorExample[];
  /** Document the editor opens with when there is no ?url=, #share, or saved draft. Default: the Suluk Galaxy example. */
  initialDoc?: unknown;
  /** Extra CSS appended to the page. */
  customCss?: string;
}

const DEFAULT_FORK = "/vendor/scalar/standalone-suluk.js";
const DEFAULT_CLIENT = "/editor.client.js";
const DEFAULT_FAVICON = "https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/favicon.svg";

const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
/** JSON for an inline <script>, with </script> and <!-- neutralized. */
const jsConst = (v: unknown) => JSON.stringify(v).replace(/</g, "\\u003c");

const STYLE = `
:root{--bg:#0b0e14;--bg2:#11151f;--bd:#222838;--fg:#d7dce5;--mut:#8a93a6;--acc:#7c9cff;--ok:#37d39b;--bad:#ff6b6b;}
*{box-sizing:border-box}
html,body{margin:0;height:100%;background:var(--bg);color:var(--fg);font:14px/1.5 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
.suluk-app{display:flex;flex-direction:column;height:100%}
.suluk-bar{display:flex;align-items:center;gap:14px;padding:8px 14px;background:var(--bg2);border-bottom:1px solid var(--bd);flex:0 0 auto}
.suluk-bar .brand{font-weight:600;letter-spacing:.2px;white-space:nowrap}
.suluk-bar .brand .sub{color:var(--mut);font-weight:400;font-size:12px;margin-left:6px}
.suluk-bar .tools{display:flex;align-items:center;gap:8px;margin-left:auto;flex-wrap:wrap}
.suluk-bar button,.suluk-bar select,.suluk-bar .ext{background:#1a2030;color:var(--fg);border:1px solid var(--bd);border-radius:7px;padding:6px 10px;font-size:12.5px;cursor:pointer;text-decoration:none;line-height:1}
.suluk-bar button:hover,.suluk-bar select:hover,.suluk-bar .ext:hover{border-color:var(--acc)}
.suluk-bar .fmt{display:inline-flex;border:1px solid var(--bd);border-radius:7px;overflow:hidden}
.suluk-bar .fmt button{border:0;border-radius:0;padding:6px 11px}
.suluk-bar .fmt button.active{background:var(--acc);color:#0b0e14;font-weight:600}
.suluk-bar #suluk-upgrade{border-color:#3a4a2a;background:#1c2417}
.suluk-split{display:flex;flex:1 1 auto;min-height:0}
.suluk-split .pane{flex:1 1 50%;min-width:0;min-height:0;overflow:auto}
.suluk-split .left{border-right:1px solid var(--bd)}
.suluk-split .left #suluk-src{height:100%}
.suluk-split .right{background:#fff}
.suluk-empty{color:var(--mut);padding:24px}
.cm-editor{height:100%}
.suluk-foot{flex:0 0 auto;background:var(--bg2);border-top:1px solid var(--bd);max-height:34vh;overflow:auto}
.suluk-footrow{display:flex;align-items:center;gap:12px;padding:6px 14px}
.suluk-status{font-size:12.5px}
.suluk-status.ok{color:var(--ok)}
.suluk-status.bad{color:var(--bad)}
.suluk-grade{font-size:11.5px;border:1px solid var(--bd);border-radius:20px;padding:2px 9px;color:var(--mut)}
.suluk-grade.g-A{color:var(--ok);border-color:#235} .suluk-grade.g-B{color:#9fd} .suluk-grade.g-C{color:#fd9}
.suluk-grade.g-D{color:#fb8} .suluk-grade.g-F{color:var(--bad)}
.suluk-diag{list-style:none;margin:0;padding:0 14px 10px}
.suluk-diag li{font-size:12px;padding:3px 0;border-top:1px solid var(--bd);color:var(--fg)}
.suluk-diag li.error code{color:var(--bad)} .suluk-diag li.warning code{color:#fd9}
.suluk-diag code{color:var(--acc);font-size:11.5px}
.suluk-modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);align-items:center;justify-content:center;z-index:50;padding:24px}
.suluk-modal .box{background:var(--bg2);border:1px solid var(--bd);border-radius:12px;max-width:880px;width:100%;max-height:84vh;display:flex;flex-direction:column}
.suluk-modal header{display:flex;align-items:center;padding:12px 16px;border-bottom:1px solid var(--bd)}
.suluk-modal h3{margin:0;font-size:14px}
.suluk-modal #suluk-modal-close{margin-left:auto;background:none;border:0;color:var(--mut);font-size:18px;cursor:pointer}
.suluk-modal #suluk-modal-body{overflow:auto;padding:14px 16px}
.suluk-pre{background:var(--bg);border:1px solid var(--bd);border-radius:8px;padding:12px;overflow:auto;font:12px/1.5 ui-monospace,Menlo,monospace;color:#cfe}
.suluk-diaglist{margin-bottom:12px;color:var(--fg)} .suluk-diaglist ul{margin:6px 0 0;padding-left:18px} .suluk-diaglist em{color:#fd9;font-style:normal}
.suluk-diaglist code{color:var(--acc)}
.suluk-shareurl{width:100%;background:var(--bg);border:1px solid var(--bd);border-radius:8px;padding:10px;color:var(--fg);font:12px ui-monospace,monospace}
.suluk-toast{display:none;position:fixed;bottom:18px;left:50%;transform:translateX(-50%);background:#1a2030;border:1px solid var(--acc);color:var(--fg);padding:9px 16px;border-radius:10px;z-index:60;font-size:13px;box-shadow:0 6px 24px rgba(0,0,0,.4)}
`;

/** Build the self-contained editor page. */
export function editorHtml(opts: EditorOptions = {}): string {
  const brand = opts.brand ?? "Suluk";
  const title = opts.pageTitle ?? `${brand} — OpenAPI v4 editor`;
  const forkSrc = opts.forkSrc ?? DEFAULT_FORK;
  const clientSrc = opts.clientSrc ?? DEFAULT_CLIENT;
  const favicon = opts.faviconHref ?? DEFAULT_FAVICON;
  const examples = opts.examples ?? defaultExamples;
  const initialDoc = opts.initialDoc ?? defaultExample.doc;
  const config = { examples, initial: { text: JSON.stringify(initialDoc, null, 2), format: "json" }, brand };

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<link rel="icon" type="image/svg+xml" href="${esc(favicon)}" />
<meta name="description" content="Edit OpenAPI v4 (Suluk candidate) documents with a live native-v4 reference, diagnostics, and 3.1→v4 upgrade." />
<style>${STYLE}${opts.customCss ?? ""}</style>
</head>
<body>
<div class="suluk-app">
  <header class="suluk-bar">
    <div class="brand">⛬ ${esc(brand)}<span class="sub">OpenAPI v4 editor</span></div>
    <div class="tools">
      <span class="fmt"><button id="suluk-fmt-json" class="active">JSON</button><button id="suluk-fmt-yaml">YAML</button></span>
      <select id="suluk-examples" title="Load an example"></select>
      <button id="suluk-upgrade" title="Convert a pasted OpenAPI 3.1 document to native v4">Upgrade from 3.1</button>
      <button id="suluk-downgrade" title="Preview this v4 document as OpenAPI 3.1 (shows what is lost)">Show as 3.1</button>
      <button id="suluk-share" title="Copy a self-contained share link">Share</button>
      <a class="ext" href="https://github.com/MahmoodKhalil57/suluk" target="_blank" rel="noopener">GitHub</a>
    </div>
  </header>
  <main class="suluk-split">
    <section class="pane left"><div id="suluk-src"></div></section>
    <section class="pane right"><div id="suluk-preview"><p class="suluk-empty">Loading preview…</p></div></section>
  </main>
  <footer class="suluk-foot">
    <div class="suluk-footrow">
      <span id="suluk-status" class="suluk-status">Ready.</span>
      <span id="suluk-grade" class="suluk-grade" style="display:none"></span>
    </div>
    <ul id="suluk-diag" class="suluk-diag" style="display:none"></ul>
  </footer>
</div>
<div id="suluk-modal" class="suluk-modal"><div class="box"><header><h3 id="suluk-modal-title"></h3><button id="suluk-modal-close">✕</button></header><div id="suluk-modal-body"></div></div></div>
<div id="suluk-toast" class="suluk-toast"></div>
<script>window.__SULUK_EDITOR__=${jsConst(config)};</script>
<script src="${esc(forkSrc)}"></script>
<script type="module" src="${esc(clientSrc)}"></script>
</body>
</html>`;
}

/** The editor page as a text/html Response (Workers / Bun.serve / Hono). */
export function editorResponse(opts: EditorOptions = {}): Response {
  return new Response(editorHtml(opts), { headers: { "content-type": "text/html; charset=utf-8" } });
}
